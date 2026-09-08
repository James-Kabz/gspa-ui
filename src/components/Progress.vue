<template>
  <div :class="cn(containerVariants({ size }), $attrs.class)">
    <div
      :class="cn(progressVariants({ variant }))"
      :style="{ width: `${clampedValue}%` }"
      role="progressbar"
      :aria-valuenow="clampedValue"
      :aria-valuemin="0"
      :aria-valuemax="100"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

const props = defineProps({
  value: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['sm', 'md', 'lg', 'default'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'success', 'warning', 'danger'].includes(value)
  }
})

const clampedValue = computed(() => {
  const percentage = (props.value / props.max) * 100
  return Math.min(Math.max(percentage, 0), 100)
})

const containerVariants = cva(
  'relative w-full overflow-hidden rounded-full ui-surface-muted  border',
  {
    variants: {
      size: {
        sm: 'h-1.5',
        default: 'h-2',
        md: 'h-3',
        lg: 'h-4'
      }
    },
    defaultVariants: {
      size: 'default'
    }
  }
)

const progressVariants = cva(
  'h-full w-full flex-1 transition-all duration-300 ease-in-out rounded-full',
  {
    variants: {
      variant: {
        default: 'ui-primary-bg',
        success: 'ui-success-bg',
        warning: 'ui-warning-bg',
        danger: 'ui-danger-bg'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)
</script>
