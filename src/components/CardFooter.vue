<template>
  <div :class="footerClasses">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'compact', 'spacious'].includes(value)
  }
})

const footerVariants = cva('flex items-center p-6 pt-0 ui-text', {
  variants: {
    variant: {
      default: 'p-6 pt-0',
      compact: 'p-4 pt-0',
      spacious: 'p-8 pt-0'
    }
  }
})

const footerClasses = computed(() => 
  cn(footerVariants({ variant: props.variant }))
)
</script>
