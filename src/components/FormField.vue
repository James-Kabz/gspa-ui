<template>
  <div :class="cn(fieldVariants({ size }), $attrs.class)">
    <label v-if="label" :for="fieldId" :class="cn(labelVariants({ size }))">
      {{ label }}
      <span v-if="required" class="ui-danger ml-1" aria-hidden="true">*</span>
      <span v-if="required" class="sr-only"> (required)</span>
    </label>

    <p v-if="description" :id="descriptionId" :class="cn(descriptionVariants({ size }))">{{ description }}</p>

    <div class="relative">
      <DatePicker
        v-if="type === 'date'"
        :id="fieldId"
        :model-value="modelValue"
        :disabled="disabled"
        :required="required"
        :aria-describedby="ariaDescribedBy"
        :aria-invalid="hasError"
        :class="hasError ? 'border-(--ui-danger)' : ''"
        @update:model-value="emit('update:modelValue', $event)"
      />
      <slot
        v-else
        :field-id="fieldId"
        :has-error="hasError"
        :aria-described-by="ariaDescribedBy"
        :input-type="inputType"
        :show-password="showPassword"
        :toggle-password-visibility="togglePasswordVisibility"
      />

      <button
        v-if="type === 'password'"
        type="button"
        class="absolute inset-y-0 right-0 flex items-center pr-3 ui-text-muted transition-colors hover:text-(--ui-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-ring) focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="disabled"
        :aria-controls="fieldId"
        :aria-label="showPassword ? hidePasswordLabel : showPasswordLabel"
        @click="togglePasswordVisibility"
      >
        <svg v-if="showPassword" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.2A10.7 10.7 0 0112 4c5 0 8.7 4.4 9.6 6.5.2.3.2.7 0 1a15 15 0 01-2.2 3.3M6.2 6.2A15.8 15.8 0 002.4 10.5c-.2.3-.2.7 0 1C3.3 13.6 7 18 12 18c1 0 2-.2 2.9-.5" />
        </svg>
        <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.4 10.5C3.3 8.4 7 4 12 4s8.7 4.4 9.6 6.5c.2.3.2.7 0 1C20.7 13.6 17 18 12 18s-8.7-4.4-9.6-6.5a1.1 1.1 0 010-1z" />
          <circle cx="12" cy="11" r="3" stroke-width="2" />
        </svg>
      </button>
    </div>

    <Transition name="ui-field-message">
      <div v-if="hasError" :id="errorId" :class="cn(messageVariants({ size, intent: 'error' }))" role="alert" aria-live="polite" aria-atomic="true">
        <svg class="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M10.3 4.1L2 18.2a1.2 1.2 0 001 1.8h18a1.2 1.2 0 001-1.8L13.7 4.1a2 2 0 00-3.4 0z" />
        </svg>
        <span>{{ errorMessage }}</span>
      </div>
    </Transition>

    <p v-if="helpText && !hasError" :id="helpId" :class="cn(helpVariants({ size }))">{{ helpText }}</p>

    <Transition name="ui-field-message">
      <div v-if="success && !hasError" :id="successId" :class="cn(messageVariants({ size, intent: 'success' }))" role="status" aria-live="polite">
        <svg class="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12l4 4L19 6" />
        </svg>
        <span>{{ success }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref, useId, type PropType } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'
import { FORM_FIELD_CONTEXT_KEY } from '../lib/form-field.js'
import type { ComponentSize, FormFieldType } from '../types.js'
import DatePicker from './DatePicker.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  label: String,
  description: String,
  error: String,
  serverError: String,
  success: String,
  helpText: String,
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  autocomplete: String,
  name: String,
  type: { type: String as PropType<FormFieldType>, default: 'text' },
  modelValue: { type: [String, Date], default: '' },
  size: { type: String as PropType<ComponentSize>, default: 'md' },
  id: String,
  showPasswordLabel: { type: String, default: 'Show password' },
  hidePasswordLabel: { type: String, default: 'Hide password' }
})

const emit = defineEmits<{ 'update:modelValue': [value: string | Date] }>()
const generatedId = `field-${useId()}`
const fieldId = computed(() => props.id || generatedId)
const errorMessage = computed(() => props.serverError || props.error || '')
const hasError = computed(() => Boolean(errorMessage.value))
const showPassword = ref(false)
const inputType = computed(() => props.type === 'password' && showPassword.value ? 'text' : props.type)
const descriptionId = computed(() => `${fieldId.value}-description`)
const errorId = computed(() => `${fieldId.value}-error`)
const helpId = computed(() => `${fieldId.value}-help`)
const successId = computed(() => `${fieldId.value}-success`)

const togglePasswordVisibility = () => {
  if (!props.disabled) showPassword.value = !showPassword.value
}

const ariaDescribedBy = computed(() => {
  const ids = []
  if (props.description) ids.push(descriptionId.value)
  if (hasError.value) ids.push(errorId.value)
  else if (props.helpText) ids.push(helpId.value)
  if (props.success && !hasError.value) ids.push(successId.value)
  return ids.length ? ids.join(' ') : undefined
})

provide(FORM_FIELD_CONTEXT_KEY, {
  id: fieldId,
  describedBy: ariaDescribedBy,
  invalid: hasError,
  required: computed(() => props.required),
  disabled: computed(() => props.disabled),
  autocomplete: computed(() => props.autocomplete),
  name: computed(() => props.name),
  inputType,
  originalType: computed(() => props.type),
  hasPasswordToggle: computed(() => props.type === 'password')
})

const fieldVariants = cva('ui-text', { variants: { size: { sm: 'space-y-1', md: 'space-y-2', lg: 'space-y-3' } }, defaultVariants: { size: 'md' } })
const labelVariants = cva('block ui-text', { variants: { size: { sm: 'text-xs font-medium', md: 'text-sm font-medium', lg: 'text-base font-medium' } }, defaultVariants: { size: 'md' } })
const descriptionVariants = cva('ui-text-muted', { variants: { size: { sm: 'text-xs', md: 'text-sm', lg: 'text-base' } }, defaultVariants: { size: 'md' } })
const messageVariants = cva('flex items-start gap-2', { variants: { size: { sm: 'text-xs', md: 'text-sm', lg: 'text-sm' }, intent: { error: 'ui-danger', success: 'ui-success' } }, defaultVariants: { size: 'md', intent: 'error' } })
const helpVariants = cva('ui-text-muted', { variants: { size: { sm: 'text-xs', md: 'text-sm', lg: 'text-sm' } }, defaultVariants: { size: 'md' } })
</script>
