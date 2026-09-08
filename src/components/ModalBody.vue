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
    validator: (value) => ['default', 'compact'].includes(value)
  }
})

const bodyVariants = cva('', {
  variants: {
    variant: {
      default: 'py-4',
      compact: 'py-2'
    }
  }
})

const bodyClasses = computed(() => 
  cn(bodyVariants({ variant: props.variant }))
)
</script>
