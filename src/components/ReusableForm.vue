<script setup>
import { computed, ref, watch, useSlots } from 'vue'
import Slider from './Slider.vue'
import DatePicker from './DatePicker.vue'
import FormField from './FormField.vue'
import Input from './Input.vue'
import Textarea from './Textarea.vue'
import Select from './Select.vue'
import MultiSelect from './MultiSelect.vue'
import Button from './Button.vue'
import Label from './Label.vue'
import FileUpload from './FileUpload.vue'
import { toast } from '../lib/toast'

const props = defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  entityName: { type: String, default: 'Item' },
  fields: {
    type: Array,
    required: true,
    validator: (fields) => Array.isArray(fields) && fields.every((field) => field?.name && field?.label && field?.type),
  },
  sections: { type: Array, default: () => [] },
  initialData: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  customValidation: { type: Function, default: null },
  crossValidate: { type: Function, default: null },
  submitLabel: { type: String, default: 'Submit' },
  showReset: { type: Boolean, default: true },
  showCancel: { type: Boolean, default: true },
  showSubmit: { type: Boolean, default: true },
  formType: {
    type: String,
    default: 'create',
    validator: (value) => ['create', 'edit'].includes(value),
  },
})

const emit = defineEmits(['submit', 'reset', 'cancel', 'form-change'])
const slots = useSlots()

const isLoading = computed(() => props.loading)
const formData = ref({})
const errors = ref({})
const passwordVisibility = ref({})
const uploadingFilesMap = ref({})
const isHydratingFromProps = ref(false)

const hasSections = computed(() => Array.isArray(props.sections) && props.sections.length > 0)
const hasActionsSlot = computed(() => Boolean(slots.actions))

const normalizedSections = computed(() => {
  if (!hasSections.value) {
    return [{
      id: 'default',
      title: '',
      description: '',
      icon: '',
      wrapperClass: '',
      gridClass: 'grid grid-cols-12 gap-4',
      card: false,
      fields: props.fields || [],
    }]
  }

  return props.sections.map((section, index) => {
    const id = section?.id || `section-${index + 1}`
    const sectionFields = Array.isArray(section?.fields)
      ? section.fields
      : (props.fields || []).filter((field) => field.sectionId === id)

    return {
      id,
      title: section?.title || '',
      description: section?.description || '',
      icon: section?.icon || '',
      wrapperClass: section?.wrapperClass || '',
      gridClass: section?.gridClass || 'grid grid-cols-12 gap-4',
      card: section?.card !== false,
      fields: sectionFields,
    }
  })
})

const allFields = computed(() => normalizedSections.value.flatMap((section) => section.fields || []))
const isValid = computed(() => Object.keys(errors.value).length === 0)

const getFormSignature = (data) => {
  try {
    return JSON.stringify(data ?? {})
  } catch {
    return ''
  }
}

const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

const setNestedValue = (obj, path, value) => {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') current[key] = {}
    return current[key]
  }, obj)
  target[lastKey] = value
}

const getDefaultValue = (field) => {
  if (field.type === 'checkbox' || field.type === 'switch') return false
  if (field.type === 'number' || field.type === 'slider' || field.type === 'range') return field.min ?? 0
  if (field.type === 'file') return null
  if (field.type === 'multifile' || field.type === 'multiselect') return []
  if (field.type === 'radio') return field.options?.[0]?.value || ''
  return ''
}

const initializeFormData = () => {
  const data = {}
  allFields.value.forEach((field) => {
    if (field.name.includes('.')) setNestedValue(data, field.name, getDefaultValue(field))
    else data[field.name] = getDefaultValue(field)
  })
  return data
}

const populateFormData = (source) => {
  const nextData = {}
  allFields.value.forEach((field) => {
    const raw = field.name.includes('.') ? getNestedValue(source, field.name) : source?.[field.name]
    const fallback = getDefaultValue(field)
    const value = raw === undefined ? fallback : raw

    if (field.name.includes('.')) {
      setNestedValue(nextData, field.name, value)
      return
    }

    if (field.type === 'file') nextData[field.name] = null
    else if (field.type === 'multifile' || field.type === 'multiselect') nextData[field.name] = Array.isArray(value) ? value : []
    else nextData[field.name] = value
  })
  return nextData
}

watch(
  () => props.initialData,
  (newData) => {
    const nextData = newData ? populateFormData(newData) : initializeFormData()
    if (getFormSignature(nextData) === getFormSignature(formData.value)) return

    isHydratingFromProps.value = true
    formData.value = nextData
    queueMicrotask(() => {
      isHydratingFromProps.value = false
    })
  },
  { immediate: true },
)

watch(
  formData,
  (newData) => {
    if (isHydratingFromProps.value) return
    emit('form-change', newData)
  },
  { deep: true },
)

const getFieldValue = (fieldName) => (fieldName.includes('.') ? getNestedValue(formData.value, fieldName) : formData.value[fieldName])
const getFieldError = (fieldName) => {
  const direct = errors.value?.[fieldName]
  if (direct) return direct
  return fieldName.includes('.') ? getNestedValue(errors.value, fieldName) : undefined
}

const setFieldValue = (fieldName, value) => {
  if (fieldName.includes('.')) setNestedValue(formData.value, fieldName, value)
  else formData.value[fieldName] = value
}

const isPasswordField = (field) => field?.type === 'password'
const isPasswordVisible = (field) => Boolean(passwordVisibility.value[field.name])
const getInputType = (field) => {
  if (isPasswordField(field)) return isPasswordVisible(field) ? 'text' : 'password'
  return field.type
}

const togglePasswordVisibility = (field) => {
  if (!field?.name) return
  passwordVisibility.value = {
    ...passwordVisibility.value,
    [field.name]: !passwordVisibility.value[field.name],
  }
}

const validateForm = () => {
  errors.value = {}

  allFields.value.forEach((field) => {
    const value = getFieldValue(field.name)

    if (field.required && !field.disabled && field.type !== 'hidden') {
      if (field.type === 'checkbox' || field.type === 'switch') {
        if (!value) errors.value[field.name] = field.errorMessage || `${field.label} is required`
      } else if (field.type === 'multiselect' || field.type === 'multifile') {
        if (!Array.isArray(value) || value.length === 0) errors.value[field.name] = field.errorMessage || `${field.label} is required`
      } else if (field.type === 'number' || field.type === 'slider' || field.type === 'range') {
        if (value === '' || value === null || value === undefined) errors.value[field.name] = field.errorMessage || `${field.label} is required`
        else if (field.min !== undefined && Number(value) < field.min) errors.value[field.name] = `${field.label} must be at least ${field.min}`
        else if (field.max !== undefined && Number(value) > field.max) errors.value[field.name] = `${field.label} must be at most ${field.max}`
      } else if (field.type === 'email') {
        if (!value || !String(value).trim()) errors.value[field.name] = field.errorMessage || `${field.label} is required`
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) errors.value[field.name] = 'Please enter a valid email address'
      } else if (field.type === 'url') {
        if (!value || !String(value).trim()) errors.value[field.name] = field.errorMessage || `${field.label} is required`
        else if (!/^https?:\/\/.+/.test(String(value))) errors.value[field.name] = 'Please enter a valid URL'
      } else if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
        errors.value[field.name] = field.errorMessage || `${field.label} is required`
      }
    }

    if (typeof field.validate === 'function') {
      const customError = field.validate(value, formData.value)
      if (customError) errors.value[field.name] = customError
    }
  })

  if (typeof props.customValidation === 'function') {
    const customErrors = props.customValidation(formData.value)
    if (customErrors && typeof customErrors === 'object') errors.value = { ...errors.value, ...customErrors }
  }

  if (typeof props.crossValidate === 'function') {
    const crossErrors = props.crossValidate(formData.value)
    if (crossErrors && typeof crossErrors === 'object') errors.value = { ...errors.value, ...crossErrors }
  }

  return Object.keys(errors.value).length === 0
}

const resolveFieldOption = (option, field, fallback = undefined) => {
  if (typeof option === 'function') return option(formData.value, field)
  return option === undefined ? fallback : option
}

const showFieldActionButton = (field) => !!field?.actionButton && field.actionButton.show !== false
const fieldActionDisabled = (field) => {
  if (!field?.actionButton) return true
  const disabled = typeof field.actionButton.disabled === 'function'
    ? field.actionButton.disabled(formData.value, field)
    : field.actionButton.disabled
  return Boolean(isLoading.value || field.disabled || disabled)
}
const fieldActionLoading = (field) => {
  if (!field?.actionButton) return false
  return typeof field.actionButton.loading === 'function'
    ? field.actionButton.loading(formData.value, field)
    : Boolean(field.actionButton.loading)
}
const handleFieldActionClick = (field) => {
  if (typeof field?.actionButton?.onClick === 'function') field.actionButton.onClick(formData.value, field)
}

const hasTrailingIcon = (field) => isPasswordField(field) || !!resolveFieldOption(field.trailingIcon, field, null)
const getTrailingIcon = (field) => {
  if (isPasswordField(field)) return isPasswordVisible(field) ? 'eye-slash' : 'eye'
  return resolveFieldOption(field.trailingIcon, field, null)
}
const getTrailingIconTitle = (field) => {
  if (isPasswordField(field)) return isPasswordVisible(field) ? 'Hide password' : 'Show password'
  return resolveFieldOption(field.trailingIconTitle, field, 'Action')
}
const getTrailingIconAriaLabel = (field) => {
  if (isPasswordField(field)) return isPasswordVisible(field) ? 'Hide password' : 'Show password'
  return resolveFieldOption(field.trailingIconAriaLabel, field, getTrailingIconTitle(field))
}
const getTrailingIconClass = (field) => resolveFieldOption(field.trailingIconClass, field, 'w-4 h-4')
const isTrailingIconDisabled = (field) => Boolean(isLoading.value || field.disabled || resolveFieldOption(field.trailingIconDisabled, field, false))
const handleTrailingIconClick = (field) => {
  if (isTrailingIconDisabled(field)) return
  if (isPasswordField(field)) {
    togglePasswordVisibility(field)
    return
  }
  if (typeof field?.onTrailingIconClick === 'function') field.onTrailingIconClick(formData.value, field)
}

const handleSelectChange = async (field, value) => {
  setFieldValue(field.name, value)
  if (typeof field?.onChange === 'function') {
    try {
      await field.onChange(value, formData.value)
    } catch {
      toast.error('An error occurred while processing the change')
    }
  }
}

const handleSliderChange = (field, value) => {
  setFieldValue(field.name, value)
  if (typeof field?.onChange === 'function') {
    try {
      field.onChange(value, formData.value)
    } catch {
      toast.error('An error occurred while processing the change')
    }
  }
}

const handleFileSelected = (field, file) => {
  setFieldValue(field.name, file)
  if (typeof field?.onChange === 'function') field.onChange(file, formData.value)
}

const handleFileRemoved = (field, file) => {
  setFieldValue(field.name, file)
  if (typeof field?.onChange === 'function') field.onChange(file, formData.value)
}

const handleMultiFileSelected = (field, files) => {
  setFieldValue(field.name, files)
  if (typeof field?.onChange === 'function') field.onChange(files, formData.value)
}

const handleMultiFileRemoved = (field, files) => {
  setFieldValue(field.name, files)
  if (typeof field?.onChange === 'function') field.onChange(files, formData.value)
}

const convertToFormData = (data) => {
  const formDataObj = new FormData()

  Object.keys(data).forEach((key) => {
    const value = data[key]
    if (value === null || value === undefined) return

    if (value instanceof File) {
      formDataObj.append(key, value)
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File) formDataObj.append(`${key}[]`, item)
        else formDataObj.append(`${key}[${index}]`, item)
      })
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      Object.keys(value).forEach((nestedKey) => {
        formDataObj.append(`${key}[${nestedKey}]`, value[nestedKey])
      })
    } else {
      formDataObj.append(key, value)
    }
  })

  return formDataObj
}

const buildSubmissionPayload = () => {
  const preparedData = {}
  let hasFiles = false

  allFields.value.forEach((field) => {
    const value = getFieldValue(field.name)

    if (field.type === 'number' || field.type === 'slider' || field.type === 'range') {
      const numeric = value === '' || value === null || value === undefined ? value : Number(value)
      if (field.name.includes('.')) setNestedValue(preparedData, field.name, numeric)
      else preparedData[field.name] = numeric
      return
    }

    if (field.type === 'file') {
      if (value instanceof File) {
        hasFiles = true
        preparedData[field.name] = value
      } else if (props.formType === 'edit' && value) {
        preparedData[field.name] = value
      }
      return
    }

    if (field.type === 'multifile') {
      if (Array.isArray(value) && value.some((item) => item instanceof File)) {
        hasFiles = true
        preparedData[field.name] = value
      } else if (props.formType === 'edit' && Array.isArray(value) && value.length > 0) {
        preparedData[field.name] = value
      }
      return
    }

    const finalValue = ['text', 'textarea', 'date', 'email', 'url', 'tel', 'search', 'time', 'datetime-local', 'month', 'week'].includes(field.type)
      ? (typeof value === 'string' ? value.trim() : value)
      : value

    if (field.name.includes('.')) setNestedValue(preparedData, field.name, finalValue)
    else preparedData[field.name] = finalValue
  })

  let submissionData = preparedData
  if (hasFiles) {
    submissionData = convertToFormData(preparedData)
    if (props.formType === 'edit') submissionData.append('_method', 'PUT')
  }

  return { formData: submissionData, hasFiles }
}

const submitInternal = async () => {
  const hasUploadingFiles = allFields.value.some(
    (field) => field.type !== 'multifile' && (uploadingFilesMap.value[field.name] || []).length > 0,
  )

  if (hasUploadingFiles) {
    toast.error('Please wait for all files to finish uploading')
    return false
  }

  if (!validateForm()) {
    toast.error('Please fix the validation errors before submitting')
    return false
  }

  const payload = buildSubmissionPayload()
  emit('submit', {
    formData: payload.formData,
    formType: props.formType,
    originalData: props.initialData,
    hasFiles: payload.hasFiles,
  })

  return true
}

const handleSubmit = async () => {
  try {
    await submitInternal()
  } catch {
    toast.error('An error occurred during submission')
  }
}

const handleReset = () => {
  formData.value = initializeFormData()
  errors.value = {}
  uploadingFilesMap.value = {}
  emit('reset')
}

const handleCancel = () => emit('cancel')
</script>

<template>
  <div class="w-full p-2">
    <div
      v-if="title"
      class="mb-6"
    >
      <h2 class="text-xl font-semibold ui-text">
        {{ title }}
      </h2>
      <p
        v-if="description"
        class="mt-1 text-sm ui-text-muted"
      >
        {{ description }}
      </p>
    </div>

    <form
      class="space-y-6"
      @submit.prevent="handleSubmit"
    >
      <div
        v-for="section in normalizedSections"
        :key="section.id"
        :class="section.wrapperClass || ''"
      >
        <div :class="section.card ? 'ui-surface border ui-border-strong rounded-xl p-4 sm:p-5' : ''">
          <slot
            name="section-header"
            :section="section"
          >
            <div
              v-if="section.title || section.description"
              class="mb-4"
            >
              <h3
                v-if="section.title"
                class="text-base font-semibold ui-text"
              >
                {{ section.title }}
              </h3>
              <p
                v-if="section.description"
                class="mt-1 text-sm ui-text-muted"
              >
                {{ section.description }}
              </p>
            </div>
          </slot>

          <div :class="section.gridClass">
            <div
              v-for="field in section.fields"
              :key="field.name"
              :class="field.wrapperClass || 'col-span-12'"
            >
              <template v-if="field.type === 'hidden'">
                <input
                  :value="getFieldValue(field.name)"
                  type="hidden"
                >
              </template>

              <FormField
                v-else
                :id="`form-${entityName}-${field.name}`"
                :label="field.label"
                :required="Boolean(field.required)"
                :error="getFieldError(field.name)"
                :error-message="getFieldError(field.name)"
                :help-text="field.helpText"
                :class="field.labelClass || ''"
              >
                <template #default="{ fieldId, hasError, ariaDescribedBy }">
                  <slot
                    :name="`field-${field.name}`"
                    :field="field"
                    :form-data="formData"
                    :error="getFieldError(field.name)"
                    :update="(value) => setFieldValue(field.name, value)"
                  >
                    <div
                      v-if="['text', 'number', 'password', 'color', 'email', 'tel', 'url', 'search'].includes(field.type)"
                      :class="['relative', hasTrailingIcon(field) ? 'has-trailing-icon' : '']"
                    >
                      <Input
                        :id="fieldId"
                        :model-value="getFieldValue(field.name)"
                        :type="getInputType(field)"
                        :placeholder="field.placeholder"
                        :disabled="isLoading || field.disabled"
                        :readonly="field.readonly || field.disabled"
                        :class="[hasError ? 'border-(--ui-danger)' : 'ui-border-strong', field.inputClass || '']"
                        :aria-describedby="ariaDescribedBy"
                        @update:model-value="setFieldValue(field.name, $event)"
                      />
                      <button
                        v-if="hasTrailingIcon(field)"
                        type="button"
                        :class="['absolute right-3 top-1/2 -translate-y-1/2 ui-text hover:text-(--ui-text) transition-colors', isTrailingIconDisabled(field) ? 'opacity-50 cursor-not-allowed' : '']"
                        :title="getTrailingIconTitle(field)"
                        :aria-label="getTrailingIconAriaLabel(field)"
                        :disabled="isTrailingIconDisabled(field)"
                        @click="handleTrailingIconClick(field)"
                      >
                        <font-awesome-icon
                          :icon="getTrailingIcon(field)"
                          :class="getTrailingIconClass(field)"
                        />
                      </button>
                    </div>

                    <Textarea
                      v-else-if="field.type === 'textarea'"
                      :id="fieldId"
                      :model-value="getFieldValue(field.name)"
                      :placeholder="field.placeholder"
                      :disabled="isLoading || field.disabled"
                      :readonly="field.readonly || field.disabled"
                      :rows="field.rows || 3"
                      :class="['w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--ui-primary)', hasError ? 'border-(--ui-danger)' : 'ui-border-strong', field.inputClass || '']"
                      :aria-describedby="ariaDescribedBy"
                      @update:model-value="setFieldValue(field.name, $event)"
                    />

                    <div
                      v-else-if="field.type === 'select'"
                      class="flex w-full items-center gap-2"
                    >
                      <div class="min-w-0 flex-1">
                        <Select
                          :id="fieldId"
                          :model-value="getFieldValue(field.name)"
                          :options="field.options"
                          :placeholder="field.placeholder || 'Select an option'"
                          :disabled="isLoading || field.disabled"
                          :has-error="hasError"
                          :aria-describedby="ariaDescribedBy"
                          @update:model-value="handleSelectChange(field, $event)"
                        />
                      </div>
                      <Button
                        v-if="showFieldActionButton(field)"
                        type="button"
                        :variant="field.actionButton.variant || 'outline'"
                        :size="field.actionButton.size || 'icon'"
                        :class="field.actionButton.class || ''"
                        :title="field.actionButton.title || field.actionButton.label || 'Action'"
                        :disabled="fieldActionDisabled(field)"
                        :loading="fieldActionLoading(field)"
                        @click="handleFieldActionClick(field)"
                      >
                        {{ field.actionButton.label || '+' }}
                      </Button>
                    </div>

                    <div
                      v-else-if="field.type === 'multiselect'"
                      class="flex w-full items-center gap-2"
                    >
                      <div class="min-w-0 flex-1">
                        <MultiSelect
                          :id="fieldId"
                          :model-value="getFieldValue(field.name)"
                          :options="field.options"
                          :disabled="isLoading || field.disabled"
                          :placeholder="field.placeholder || 'Select options'"
                          :has-error="hasError"
                          :aria-describedby="ariaDescribedBy"
                          @update:model-value="setFieldValue(field.name, $event)"
                        />
                      </div>
                      <Button
                        v-if="showFieldActionButton(field)"
                        type="button"
                        :variant="field.actionButton.variant || 'outline'"
                        :size="field.actionButton.size || 'icon'"
                        :class="field.actionButton.class || ''"
                        :title="field.actionButton.title || field.actionButton.label || 'Action'"
                        :disabled="fieldActionDisabled(field)"
                        :loading="fieldActionLoading(field)"
                        @click="handleFieldActionClick(field)"
                      >
                        {{ field.actionButton.label || '+' }}
                      </Button>
                    </div>

                    <Select
                      v-else-if="field.type === 'combobox'"
                      :id="fieldId"
                      :model-value="getFieldValue(field.name)"
                      :options="field.options"
                      :placeholder="field.placeholder || 'Select or type to add new'"
                      :disabled="isLoading || field.disabled"
                      :has-error="hasError"
                      :aria-describedby="ariaDescribedBy"
                      :allow-create="field.allowCreate"
                      @update:model-value="handleSelectChange(field, $event)"
                    />

                    <div
                      v-else-if="field.type === 'checkbox'"
                      class="flex items-center"
                    >
                      <Input
                        :id="fieldId"
                        :model-value="getFieldValue(field.name)"
                        type="checkbox"
                        :disabled="isLoading || field.disabled"
                        class="h-4 w-4 rounded ui-border-strong"
                        :aria-describedby="ariaDescribedBy"
                        @update:model-value="setFieldValue(field.name, $event)"
                      />
                      <Label
                        :for="fieldId"
                        class="ml-2 text-sm ui-text"
                      >{{ field.checkboxLabel || field.label }}</Label>
                    </div>

                    <div
                      v-else-if="field.type === 'switch'"
                      class="flex items-center"
                    >
                      <button
                        :id="fieldId"
                        type="button"
                        role="switch"
                        :aria-checked="getFieldValue(field.name)"
                        :disabled="isLoading || field.disabled"
                        :class="[
                          'relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-(--ui-primary) focus:ring-offset-2',
                          getFieldValue(field.name) ? 'ui-primary-bg border-(--ui-primary)' : 'ui-surface-soft border-(--ui-border-strong)',
                          (isLoading || field.disabled) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                        ]"
                        @click="setFieldValue(field.name, !getFieldValue(field.name))"
                      >
                        <span :class="['inline-block h-4 w-4 transform rounded-full ui-surface border ui-border-strong transition-transform', getFieldValue(field.name) ? 'translate-x-6' : 'translate-x-1']" />
                      </button>
                      <Label
                        :for="fieldId"
                        class="ml-3 text-sm ui-text"
                      >{{ field.checkboxLabel || field.label }}</Label>
                    </div>

                    <div
                      v-else-if="field.type === 'radio'"
                      class="space-y-2"
                    >
                      <div
                        v-for="option in field.options"
                        :key="option.value"
                        class="flex items-center"
                      >
                        <Input
                          :id="`${fieldId}-${option.value}`"
                          :model-value="getFieldValue(field.name)"
                          type="radio"
                          :value="option.value"
                          :disabled="isLoading || field.disabled"
                          class="h-4 w-4 ui-border-strong"
                          :aria-describedby="ariaDescribedBy"
                          @update:model-value="setFieldValue(field.name, $event)"
                        />
                        <Label
                          :for="`${fieldId}-${option.value}`"
                          class="ml-2 text-sm ui-text"
                        >{{ option.label }}</Label>
                      </div>
                    </div>

                    <FileUpload
                      v-else-if="field.type === 'file'"
                      :multiple="false"
                      :accept="field.accept"
                      :max-size="field.maxSize"
                      :variant="field.variant || 'default'"
                      @files-selected="handleFileSelected(field, $event)"
                      @file-removed="handleFileRemoved(field, $event)"
                    />
                    <FileUpload
                      v-else-if="field.type === 'multifile'"
                      :multiple="field.multiple !== false"
                      :accept="field.accept"
                      :max-size="field.maxSize"
                      :max-files="field.maxFiles"
                      :variant="field.variant || 'default'"
                      @files-selected="handleMultiFileSelected(field, $event)"
                      @file-removed="handleMultiFileRemoved(field, $event)"
                    />

                    <Slider
                      v-else-if="field.type === 'slider'"
                      :model-value="getFieldValue(field.name)"
                      :min="field.min"
                      :max="field.max"
                      :step="field.step"
                      :disabled="isLoading || field.disabled"
                      @update:model-value="handleSliderChange(field, $event)"
                    />

                    <div
                      v-else-if="field.type === 'range'"
                      class="space-y-2"
                    >
                      <div class="flex items-center gap-4">
                        <Input
                          :id="fieldId"
                          :model-value="getFieldValue(field.name)"
                          type="range"
                          :min="field.min"
                          :max="field.max"
                          :step="field.step || 1"
                          :disabled="isLoading || field.disabled"
                          class="flex-1"
                          :aria-describedby="ariaDescribedBy"
                          @update:model-value="setFieldValue(field.name, $event)"
                        />
                        <span class="min-w-12 text-right text-sm font-medium ui-text">{{ getFieldValue(field.name) }}</span>
                      </div>
                    </div>

                    <DatePicker
                      v-else-if="field.type === 'date'"
                      :id="fieldId"
                      :model-value="getFieldValue(field.name)"
                      :disabled="isLoading || field.disabled"
                      :required="field.required"
                      :min="field.min"
                      :max="field.max"
                      :placeholder="field.placeholder || 'Select date'"
                      :format="field.format || 'DD/MM/YYYY'"
                      :enable-time="field.enableTime === true"
                      :minute-interval="field.minuteInterval || 1"
                      :clearable="field.clearable !== false"
                      :show-today="field.showToday !== false"
                      :calendar-position="field.calendarPosition || 'left-0 bottom-full'"
                      :aria-describedby="ariaDescribedBy"
                      @update:model-value="setFieldValue(field.name, $event)"
                    />

                    <Input
                      v-else-if="field.type === 'time'"
                      :id="fieldId"
                      :model-value="getFieldValue(field.name)"
                      type="time"
                      :disabled="isLoading || field.disabled"
                      :class="[hasError ? 'border-(--ui-danger)' : 'ui-border-strong', field.inputClass || '']"
                      :aria-describedby="ariaDescribedBy"
                      @update:model-value="setFieldValue(field.name, $event)"
                    />
                    <DatePicker
                      v-else-if="field.type === 'datetime-local'"
                      :id="fieldId"
                      :model-value="getFieldValue(field.name)"
                      :disabled="isLoading || field.disabled"
                      :required="field.required"
                      :min="field.min"
                      :max="field.max"
                      :placeholder="field.placeholder || 'Select date and time'"
                      :format="field.format || 'DD/MM/YYYY'"
                      :enable-time="true"
                      :minute-interval="field.minuteInterval || 1"
                      :clearable="field.clearable !== false"
                      :show-today="field.showToday !== false"
                      :aria-describedby="ariaDescribedBy"
                      @update:model-value="setFieldValue(field.name, $event)"
                    />
                    <Input
                      v-else-if="field.type === 'month'"
                      :id="fieldId"
                      :model-value="getFieldValue(field.name)"
                      type="month"
                      :disabled="isLoading || field.disabled"
                      :class="[hasError ? 'border-(--ui-danger)' : 'ui-border-strong', field.inputClass || '']"
                      :aria-describedby="ariaDescribedBy"
                      @update:model-value="setFieldValue(field.name, $event)"
                    />
                    <Input
                      v-else-if="field.type === 'week'"
                      :id="fieldId"
                      :model-value="getFieldValue(field.name)"
                      type="week"
                      :disabled="isLoading || field.disabled"
                      :class="[hasError ? 'border-(--ui-danger)' : 'ui-border-strong', field.inputClass || '']"
                      :aria-describedby="ariaDescribedBy"
                      @update:model-value="setFieldValue(field.name, $event)"
                    />
                  </slot>
                </template>
              </FormField>
            </div>
          </div>
        </div>
      </div>

      <slot
        name="actions"
        :form-data="formData"
        :is-valid="isValid"
        :submit="submitInternal"
      >
        <div
          v-if="showSubmit"
          class="flex justify-end gap-3 pt-6"
        >
          <Button
            v-if="showReset"
            type="button"
            variant="outline"
            :disabled="isLoading"
            @click="handleReset"
          >
            Reset
          </Button>
          <Button
            v-if="showCancel"
            type="button"
            variant="outline"
            :disabled="isLoading"
            @click="handleCancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            :disabled="isLoading"
            :loading="isLoading"
            variant="default"
          >
            {{ submitLabel }}
          </Button>
        </div>
      </slot>

      <div
        v-if="showSubmit && hasActionsSlot"
        class="hidden"
      />
    </form>
  </div>
</template>

<style scoped>
.has-trailing-icon :deep(input) {
  padding-right: 2.5rem;
}
</style>
