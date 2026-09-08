<template>
  <div :class="groupClasses">
    <div
      v-if="$slots.prefix"
      class="flex items-center px-3 bg-muted border border-r-0 rounded-l-md"
    >
      <slot name="prefix" />
    </div>
    <slot />
    <div
      v-if="$slots.suffix"
      class="flex items-center px-3 bg-muted border border-l-0 rounded-r-md"
    >
      <slot name="suffix" />
    </div>
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
    validator: (value) => ['default', 'outline'].includes(value)
  }
})

const groupVariants = cva('flex w-full', {
  variants: {
    variant: {
      default: '[&>input]:rounded-none [&>input:first-child]:rounded-l-md [&>input:last-child]:rounded-r-md',
      outline: 'border ui-border-strong  rounded-md [&>input]:border-0 [&>input]:rounded-none'
    }
  }
})

const groupClasses = computed(() => 
  cn(groupVariants({ variant: props.variant }))
)
</script>
