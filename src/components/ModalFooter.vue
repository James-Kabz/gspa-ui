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
    validator: (value) => ['default', 'center'].includes(value)
  }
})

const footerVariants = cva('flex gap-2 pt-4', {
  variants: {
    variant: {
      default: 'flex-col-reverse sm:flex-row sm:justify-end',
      center: 'justify-center'
    }
  }
})

const footerClasses = computed(() => 
  cn(footerVariants({ variant: props.variant }))
)
</script>
