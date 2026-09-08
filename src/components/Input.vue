<template>
  <div class="relative">
    <div
      v-if="iconLeft"
      class="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
    >
      <component
        :is="iconLeft"
        :class="iconClasses"
      />
    </div>

    <input
      :id="inputId"
      ref="inputRef"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :autocomplete="autocomplete"
      :class="inputClasses"
      :aria-describedby="ariaDescribedBy"
      :aria-invalid="hasError"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
      @keydown="handleKeydown"
    >

    <div
      v-if="iconRight || clearable"
      class="absolute right-3 top-1/2 transform -translate-y-1/2"
    >
      <button
        v-if="clearable && modelValue && !disabled"
        class="ui-text hover:text-(--ui-text) transition-colors"
        type="button"
        :aria-label="clearLabel"
        @click="handleClear"
      >
        <Icon
          name="x"
          class="w-5 h-5"
        />
      </button>
      <component
        :is="iconRight"
        v-else-if="iconRight"
        :class="iconClasses"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, useId } from 'vue'
import Icon from './Icon.vue'
// import XMarkIcon from './XMarkIcon.vue' // Import the XMarkIcon component

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date', 'time', 'color', 'file'].includes(value)
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'error', 'success'].includes(value)
  },
  iconLeft: {
    type: [String, Object],
    default: null
  },
  iconRight: {
    type: [String, Object],
    default: null
  },
  clearable: {
    type: Boolean,
    default: false
  },
  clearLabel: {
    type: String,
    default: 'Clear input'
  },
  autocomplete: {
    type: String,
    default: null
  },
  error: {
    type: String,
    default: null
  },
  id: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'clear', 'keydown'])

const inputRef = ref(null)
const inputId = computed(() => props.id || useId())

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleFocus = (event) => {
  emit('focus', event)
}

const handleKeydown = (event) => {
  emit('keydown', event)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

const hasError = computed(() => !!props.error || props.variant === 'error')

const ariaDescribedBy = computed(() => {
  if (props.error) return `${inputId.value}-error`
  return undefined
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }
  return sizes[props.size]
})

const variantClasses = computed(() => {
  const variants = {
    default: 'ui-border-strong focus:border-(--ui-primary) focus:ring-(--ui-primary)',
    error: 'border-(--ui-danger-soft) focus:border-(--ui-danger) focus:ring-(--ui-danger)',
    success: 'border-(--ui-success-soft) focus:border-(--ui-success) focus:ring-(--ui-success)'
  }
  return variants[props.variant]
})

const iconClasses = computed(() => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  return ['ui-text', iconSizes[props.size]]
})

const inputClasses = computed(() => [
  'block rounded-lg border ui-surface   transition-colors duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-0',
  'disabled:bg-(--ui-surface) disabled:text-(--ui-text) disabled:cursor-not-allowed',
  'placeholder:text-(--ui-text-muted)',
  props.type === 'color' ? 'w-20 h-12 cursor-pointer' : 'w-full',
  sizeClasses.value,
  variantClasses.value,
  {
    'pl-10': props.iconLeft,
    'pr-10': props.iconRight || props.clearable
  }
])

// Expose methods for parent components
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select()
})
</script>
