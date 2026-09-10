<template>
  <div>
    <div class="relative">
      <div v-if="iconLeft" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
        <component :is="iconLeft" :class="iconClasses" aria-hidden="true" />
      </div>

      <input
        :id="inputId"
        ref="inputRef"
        :name="effectiveName"
        :type="effectiveType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="effectiveDisabled"
        :readonly="readonly"
        :required="effectiveRequired"
        :autocomplete="effectiveAutocomplete"
        :class="inputClasses"
        :aria-describedby="effectiveAriaDescribedBy"
        :aria-invalid="hasError ? 'true' : undefined"
        @input="handleInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
        @keydown="emit('keydown', $event)"
      >

      <div v-if="iconRight || clearable" class="absolute right-3 top-1/2 -translate-y-1/2">
        <button
          v-if="clearable && modelValue && !effectiveDisabled"
          class="rounded-sm ui-text-muted transition-colors hover:text-(--ui-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-ring)"
          type="button"
          :aria-label="clearLabel"
          @click="handleClear"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <component v-else-if="iconRight" :is="iconRight" :class="iconClasses" aria-hidden="true" />
      </div>
    </div>

    <p v-if="standaloneError" :id="ownErrorId" class="mt-1 flex items-center gap-1 text-sm ui-danger" role="alert" aria-live="polite" aria-atomic="true">
      {{ errorMessage }}
    </p>
    <p v-else-if="helpText && !formField" :id="ownHelpId" class="mt-1 text-sm ui-text-muted">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, unref, useId, type Component, type ComputedRef, type PropType } from 'vue'
import { FORM_FIELD_CONTEXT_KEY } from '../lib/form-field.js'
import type { ComponentSize, InputType, InputVariant } from '../types.js'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String as PropType<InputType>, default: 'text' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  size: { type: String as PropType<ComponentSize>, default: 'md' },
  variant: { type: String as PropType<InputVariant>, default: 'default' },
  iconLeft: { type: [String, Object] as PropType<string | Component | null>, default: null },
  iconRight: { type: [String, Object] as PropType<string | Component | null>, default: null },
  clearable: { type: Boolean, default: false },
  clearLabel: { type: String, default: 'Clear input' },
  autocomplete: String,
  name: String,
  error: String,
  serverError: String,
  helpText: String,
  ariaDescribedBy: String,
  id: String
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  clear: []
  keydown: [event: KeyboardEvent]
}>()

type FieldContext = {
  id: ComputedRef<string>
  describedBy: ComputedRef<string | undefined>
  invalid: ComputedRef<boolean>
  required: ComputedRef<boolean>
  disabled: ComputedRef<boolean>
  autocomplete: ComputedRef<string | undefined>
  name: ComputedRef<string | undefined>
  inputType: ComputedRef<InputType>
  originalType: ComputedRef<InputType>
  hasPasswordToggle: ComputedRef<boolean>
}

const formField = inject(FORM_FIELD_CONTEXT_KEY, null) as FieldContext | null
const inputRef = ref<HTMLInputElement | null>(null)
const generatedId = `input-${useId()}`
const inputId = computed(() => props.id || unref(formField?.id) || generatedId)
const effectiveType = computed(() => {
  const fieldType = unref(formField?.inputType)
  const originalFieldType = unref(formField?.originalType)
  if (originalFieldType === 'password') return fieldType
  if (props.type === 'text' && originalFieldType && originalFieldType !== 'text') return fieldType
  return props.type
})
const effectiveDisabled = computed(() => props.disabled || Boolean(unref(formField?.disabled)))
const effectiveRequired = computed(() => props.required || Boolean(unref(formField?.required)))
const effectiveAutocomplete = computed(() => props.autocomplete ?? unref(formField?.autocomplete) ?? undefined)
const effectiveName = computed(() => props.name ?? unref(formField?.name) ?? undefined)
const errorMessage = computed(() => props.serverError || props.error || '')
const hasError = computed(() => Boolean(errorMessage.value) || props.variant === 'error' || Boolean(unref(formField?.invalid)))
const ownErrorId = computed(() => `${inputId.value}-error`)
const ownHelpId = computed(() => `${inputId.value}-help`)
const standaloneError = computed(() => Boolean(errorMessage.value) && !formField)
const effectiveAriaDescribedBy = computed(() => {
  const ids = new Set<string>()
  const add = (value: unknown) => String(value || '').split(/\s+/).filter(Boolean).forEach((id) => ids.add(id))
  add(props.ariaDescribedBy)
  add(unref(formField?.describedBy))
  if (!formField && errorMessage.value) ids.add(ownErrorId.value)
  else if (!formField && props.helpText) ids.add(ownHelpId.value)
  return ids.size ? [...ids].join(' ') : undefined
})

const handleInput = (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value)
const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

const sizeClasses = computed(() => ({ sm: 'px-3 py-1.5 text-sm', md: 'px-3 py-2 text-sm', lg: 'px-4 py-3 text-base' }[props.size]))
const variantClasses = computed(() => {
  if (hasError.value) return 'border-(--ui-danger) focus:border-(--ui-danger) focus:ring-(--ui-danger)'
  return {
    default: 'ui-border-strong focus:border-(--ui-primary) focus:ring-(--ui-ring)',
    error: 'border-(--ui-danger) focus:border-(--ui-danger) focus:ring-(--ui-danger)',
    success: 'border-(--ui-success) focus:border-(--ui-success) focus:ring-(--ui-success)'
  }[props.variant]
})
const iconClasses = computed(() => ['ui-text-muted', { sm: 'h-4 w-4', md: 'h-4 w-4', lg: 'h-5 w-5' }[props.size]])
const inputClasses = computed(() => [
  'block rounded-lg border ui-surface transition-colors duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-1',
  'disabled:bg-(--ui-surface-muted) disabled:text-(--ui-text-muted) disabled:cursor-not-allowed disabled:opacity-80',
  'placeholder:text-(--ui-text-muted)',
  props.type === 'color' ? 'h-12 w-20 cursor-pointer' : 'w-full',
  sizeClasses.value,
  variantClasses.value,
  {
    'pl-10': props.iconLeft,
    'pr-10': props.iconRight || props.clearable || Boolean(unref(formField?.hasPasswordToggle))
  }
])

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select()
})
</script>
