<script setup>
import { computed, useSlots } from 'vue'
import Modal from './Modal.vue'
import ReusableForm from './ReusableForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  modalType: {
    type: String,
    required: true,
    validator: (value) => ['create', 'edit'].includes(value),
  },
  entityName: { type: String, default: 'Item' },
  fields: { type: Array, required: true },
  sections: { type: Array, default: () => [] },
  initialData: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  customValidation: { type: Function, default: null },
  crossValidate: { type: Function, default: null },
  showSubmit: { type: Boolean, default: true },
  submitLabel: { type: String, default: '' },
  showReset: { type: Boolean, default: false },
  showCancel: { type: Boolean, default: true },
  modalSize: {
    type: String,
    default: '4xl',
    validator: (value) => ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', 'full'].includes(value),
  },
  modalHeight: { type: String, default: 'auto' },
  modalResizable: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit', 'close', 'form-change'])
const slots = useSlots()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const defaultSubmitLabel = computed(() => {
  if (props.submitLabel) return props.submitLabel
  return props.modalType === 'create' ? `Create ${props.entityName}` : `Update ${props.entityName}`
})

const modalTitle = computed(() => (props.modalType === 'create' ? `Add New ${props.entityName}` : `Edit ${props.entityName}`))
const modalDescription = computed(() => (
  props.modalType === 'create'
    ? `Fill in the details to create a new ${props.entityName.toLowerCase()}.`
    : `Update the ${props.entityName.toLowerCase()} information below.`
))

const allFields = computed(() => {
  if (Array.isArray(props.sections) && props.sections.length > 0) {
    const sectionFields = props.sections.flatMap((section) => (Array.isArray(section?.fields) ? section.fields : []))
    if (sectionFields.length > 0) return sectionFields
  }
  return props.fields || []
})

const fieldSlots = computed(() => {
  return allFields.value
    .map((field) => field?.name)
    .filter((name) => typeof name === 'string' && Boolean(name) && Boolean(slots[`field-${name}`]))
})

const handleClose = () => {
  isOpen.value = false
  emit('close')
}

const handleCancel = () => {
  handleClose()
}

const handleSubmit = (payload) => {
  emit('submit', {
    ...payload,
    modalType: props.modalType,
    originalData: props.initialData,
  })
}
</script>

<template>
  <Modal
    v-model="isOpen"
    :show-close="true"
    :close-on-backdrop="true"
    :size="modalSize"
    :class="modalHeight === 'auto' ? '' : modalHeight"
    :resizable="modalResizable"
    @close="handleClose"
  >
    <ReusableForm
      :title="modalTitle"
      :description="modalDescription"
      :entity-name="entityName"
      :fields="fields"
      :sections="sections"
      :initial-data="initialData"
      :loading="loading"
      :custom-validation="customValidation"
      :cross-validate="crossValidate"
      :submit-label="defaultSubmitLabel"
      :show-reset="showReset"
      :show-cancel="showCancel"
      :show-submit="showSubmit"
      :form-type="modalType"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @form-change="emit('form-change', $event)"
    >
      <template
        v-if="slots['section-header']"
        #section-header="slotProps"
      >
        <slot
          name="section-header"
          v-bind="slotProps"
        />
      </template>

      <template
        v-for="fieldName in fieldSlots"
        :key="`slot-${fieldName}`"
        #[`field-${fieldName}`]="slotProps"
      >
        <slot
          :name="`field-${fieldName}`"
          v-bind="slotProps"
        />
      </template>

      <template
        v-if="slots.actions"
        #actions="slotProps"
      >
        <slot
          name="actions"
          v-bind="slotProps"
        />
      </template>
    </ReusableForm>
  </Modal>
</template>
