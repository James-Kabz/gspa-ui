<template>
  <div
    :class="spinnerClasses"
    role="status"
    :aria-label="label"
  >
    <svg
      :class="svgClasses"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <span
      v-if="label"
      class="sr-only"
    >{{ label }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'secondary'].includes(value)
  },
  label: {
    type: String,
    default: 'Loading...'
  },
  class: String
})

const spinnerVariants = cva(
  'inline-flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground',
        primary: 'ui-primary',
        secondary: 'text-secondary-foreground'
      }
    }
  }
)

const sizeVariants = cva(
  'animate-spin',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12'
      }
    }
  }
)

const spinnerClasses = computed(() => 
  cn(spinnerVariants({ variant: props.variant }), props.class)
)

const svgClasses = computed(() => 
  sizeVariants({ size: props.size })
)
</script>
