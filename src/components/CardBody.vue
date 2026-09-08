<template>
  <div :class="bodyClasses">
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

const bodyVariants = cva('p-6 ui-text', {
  variants: {
    variant: {
      default: 'p-6',
      compact: 'p-4',
      spacious: 'p-8'
    }
  }
})

const bodyClasses = computed(() => 
  cn(bodyVariants({ variant: props.variant }))
)
</script>
