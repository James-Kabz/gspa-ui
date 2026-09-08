<template>
  <textarea
    :id="textareaId"
    ref="textareaRef"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :rows="rows"
    :maxlength="maxlength"
    :class="textareaClasses"
    :aria-describedby="ariaDescribedBy"
    :aria-invalid="hasError"
    @input="handleInput"
    @blur="handleBlur"
    @focus="handleFocus"
    @keydown="handleKeydown"
  />
</template>

<script setup>
import { computed, ref, useId, nextTick, watch } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  rows: { type: Number, default: 3 },
  maxlength: { type: Number, default: null },
  resize: {
    type: String,
    default: 'vertical',
    validator: (v) => ['none', 'vertical', 'horizontal', 'both'].includes(v)
  },
  autoResize: { type: Boolean, default: false },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'error', 'success'].includes(v)
  },
  error: { type: String, default: null },
  id: { type: String, default: null }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'keydown'])
const textareaRef = ref(null)
const textareaId = computed(() => props.id || useId())

// events
const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
  if (props.autoResize) {
    nextTick(() => autoResizeTextarea())
  }
}
const handleBlur = (event) => emit('blur', event)
const handleFocus = (event) => emit('focus', event)
const handleKeydown = (event) => emit('keydown', event)

// accessibility
const hasError = computed(() => !!props.error || props.variant === 'error')
const ariaDescribedBy = computed(() =>
  props.error ? `${textareaId.value}-error` : undefined
)

// variants with cva
const textareaVariants = cva(
  'block w-full rounded-lg border ui-surface   transition-colors duration-200 placeholder:text-(--ui-text-muted) focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-(--ui-surface) disabled:text-(--ui-text) disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base'
      },
      variant: {
        default: 'ui-border-strong focus:border-(--ui-primary) focus:ring-(--ui-primary)',
        error: 'border-(--ui-danger-soft) focus:border-(--ui-danger) focus:ring-(--ui-danger)',
        success: 'border-(--ui-success-soft) focus:border-(--ui-success) focus:ring-(--ui-success)'
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize'
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
      resize: 'vertical'
    }
  }
)

const textareaClasses = computed(() =>
  cn(textareaVariants({ size: props.size, variant: props.variant, resize: props.resize }))
)

// auto-resize
const autoResizeTextarea = () => {
  if (!textareaRef.value || !props.autoResize) return
  const el = textareaRef.value
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}
watch(() => props.modelValue, () => {
  if (props.autoResize) nextTick(() => autoResizeTextarea())
}, { immediate: true })

// expose methods
defineExpose({
  focus: () => textareaRef.value?.focus(),
  blur: () => textareaRef.value?.blur(),
  select: () => textareaRef.value?.select()
})
</script>
