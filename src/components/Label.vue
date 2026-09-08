<template>
  <label
    :class="labelClasses"
    :for="htmlFor"
  >
    <slot />
  </label>
</template>

<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

const props = defineProps({
  htmlFor: String,
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  required: Boolean,
  disabled: Boolean,
  class: String
})

const labelVariants = cva(
  'font-medium leading-none ui-text peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-sm',
        lg: 'text-base'
      }
    }
  }
)

const labelClasses = computed(() => 
  cn(
    labelVariants({ size: props.size }),
    props.disabled && 'cursor-not-allowed opacity-70',
    props.class
  )
)
</script>
