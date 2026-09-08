<template>
  <component
    :is="as"
    :class="textClasses"
  >
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

const props = defineProps({
  as: {
    type: String,
    default: 'p'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'muted', 'danger'].includes(value)
  },
  weight: {
    type: String,
    default: 'normal',
    validator: (value) => ['normal', 'medium', 'semibold', 'bold'].includes(value)
  },
  align: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'center', 'right', 'justify'].includes(value)
  },
  class: String
})

const textVariants = cva(
  'leading-relaxed',
  {
    variants: {
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
      },
      variant: {
        default: 'ui-text',
        muted: 'ui-text',
        danger: 'ui-danger'
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold'
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify'
      }
    }
  }
)

const textClasses = computed(() => 
  cn(textVariants({ 
    size: props.size,
    variant: props.variant,
    weight: props.weight,
    align: props.align
  }), props.class)
)
</script>
