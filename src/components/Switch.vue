<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    :class="switchClasses"
    @click="toggle"
  >
    <span :class="thumbClasses" />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

const props = defineProps({
  modelValue: Boolean,
  disabled: Boolean,
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  class: String
})

const emit = defineEmits(['update:modelValue'])

const switchVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-ring) focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-12'
      },
      checked: {
        true: 'ui-danger-bg border-(--ui-danger)',
        false: 'ui-surface-soft border-(--ui-border-strong)'
      }
    }
  }
)

const thumbVariants = cva(
  'pointer-events-none block rounded-full ui-surface border ui-border-strong shadow-sm ring-0 transition-transform',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6'
      },
      checked: {
        true: '',
        false: ''
      }
    },
    compoundVariants: [
      {
        size: 'sm',
        checked: true,
        class: 'translate-x-4'
      },
      {
        size: 'sm',
        checked: false,
        class: 'translate-x-0'
      },
      {
        size: 'md',
        checked: true,
        class: 'translate-x-5'
      },
      {
        size: 'md',
        checked: false,
        class: 'translate-x-0'
      },
      {
        size: 'lg',
        checked: true,
        class: 'translate-x-5'
      },
      {
        size: 'lg',
        checked: false,
        class: 'translate-x-0'
      }
    ]
  }
)

const switchClasses = computed(() => 
  cn(
    switchVariants({ 
      size: props.size, 
      checked: props.modelValue 
    }), 
    props.class
  )
)

const thumbClasses = computed(() => 
  thumbVariants({ 
    size: props.size, 
    checked: props.modelValue 
  })
)

const toggle = () => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>
