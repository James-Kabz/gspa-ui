<template>
  <div class="flex items-center gap-3">
    <!-- Checkbox container -->
    <div class="relative">
      <input
        :id="checkboxId"
        ref="checkboxRef"
        type="checkbox"
        :checked="isChecked"
        :indeterminate="indeterminate"
        :disabled="disabled"
        :required="required"
        :class="checkboxClasses"
        :aria-describedby="ariaDescribedBy"
        @change="handleChange"
      >

      <!-- Custom checkbox indicator -->
      <div
        :class="indicatorClasses"
        @click="handleIndicatorClick"
      >
        <CheckIcon
          v-if="isChecked && !indeterminate"
          class="w-3 h-3"
        />
        <MinusIcon
          v-else-if="indeterminate"
          class="w-3 h-3"
        />
      </div>
    </div>

    <!-- Label & optional description container -->
    <div class="flex-1">
      <label
        :for="checkboxId"
        :class="labelClasses"
      >
        <slot>{{ label }}</slot>
      </label>

      <p
        v-if="description"
        :class="descriptionClasses"
      >
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, useId, watch, h } from 'vue'

// Icon components
const CheckIcon = {
  render() {
    return h('svg', {
      fill: 'none',
      viewBox: '0 0 24 24',
      'stroke-width': '2',
      stroke: 'currentColor'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'm4.5 12.75 6 6 9-13.5'
      })
    ])
  }
}

const MinusIcon = {
  render() {
    return h('svg', {
      fill: 'none',
      viewBox: '0 0 24 24',
      'stroke-width': '2',
      stroke: 'currentColor'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M5 12h14'
      })
    ])
  }
}

const props = defineProps({
  modelValue: {
    type: [Boolean, Array],
    default: false
  },
  value: {
    type: [String, Number, Boolean],
    default: null
  },
  label: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  indeterminate: {
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
    validator: (value) => ['default', 'error'].includes(value)
  },
  id: {
    type: String,
    default: null
  },
  error: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const checkboxRef = ref(null)
const checkboxId = computed(() => props.id || useId())

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value)
  }
  return props.modelValue
})

const handleChange = (event) => {
  const checked = event.target.checked

  if (Array.isArray(props.modelValue)) {
    const newValue = [...props.modelValue]
    if (checked) {
      newValue.push(props.value)
    } else {
      const index = newValue.indexOf(props.value)
      if (index > -1) {
        newValue.splice(index, 1)
      }
    }
    emit('update:modelValue', newValue)
  } else {
    emit('update:modelValue', checked)
  }

  emit('change', checked)
}

// Handle clicks on the custom indicator
const handleIndicatorClick = () => {
  if (!props.disabled && checkboxRef.value) {
    checkboxRef.value.click()
  }
}

const ariaDescribedBy = computed(() => {
  if (props.error) return `${checkboxId.value}-error`
  return undefined
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  return sizes[props.size]
})


const checkboxClasses = computed(() => [
  'absolute inset-0 w-full h-full opacity-0 cursor-pointer',
  {
    'cursor-not-allowed': props.disabled
  }
])

const indicatorClasses = computed(() => [
  'flex items-center justify-center rounded border-2 transition-all duration-200',
  'cursor-pointer select-none',
  sizeClasses.value,
  {
    'ui-primary-bg border-(--ui-primary) ui-text': isChecked.value && !props.disabled && props.variant === 'default',
    'ui-danger-bg border-(--ui-danger) ui-text': isChecked.value && !props.disabled && props.variant === 'error',
    'ui-bg ui-border-strong  ui-text': isChecked.value && props.disabled,
    'ui-surface  ui-border-strong  hover:border-(--ui-border-strong)': !isChecked.value && !props.disabled && props.variant === 'default',
    'ui-surface  border-(--ui-danger-soft) hover:border-(--ui-danger-soft)': !isChecked.value && !props.disabled && props.variant === 'error',
    'ui-surface-muted ui-border-strong ': !isChecked.value && props.disabled,
    'cursor-not-allowed': props.disabled,
    'focus-within:ring-2 focus-within:ring-offset-2': !props.disabled,
    'focus-within:ring-(--ui-primary)': !props.disabled && props.variant === 'default',
    'focus-within:ring-(--ui-danger)': !props.disabled && props.variant === 'error'
  }
])

const labelClasses = computed(() => [
  'text-sm font-medium cursor-pointer select-none',
  {
    'ui-text': !props.disabled,
    'ui-text-muted': props.disabled
  }
])

const descriptionClasses = computed(() => [
  'text-xs ui-text mt-1'
])

// Handle indeterminate state
watch(() => props.indeterminate, (newVal) => {
  if (checkboxRef.value) {
    checkboxRef.value.indeterminate = newVal
  }
}, { immediate: true })
</script>
