<template>
  <div :class="logoClasses">
    <img 
      v-if="src" 
      :src="src" 
      :alt="alt || 'Logo'" 
      :class="imageClasses"
    >
    <div
      v-else
      :class="textClasses"
    >
      {{ text || 'Logo' }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

const props = defineProps({
  src: String,
  alt: String,
  text: String,
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'minimal'].includes(value)
  },
  class: String
})

const logoVariants = cva(
  'flex items-center',
  {
    variants: {
      size: {
        sm: 'h-6',
        md: 'h-8',
        lg: 'h-10',
        xl: 'h-12'
      }
    }
  }
)

const logoClasses = computed(() => 
  cn(logoVariants({ size: props.size }), props.class)
)

const imageClasses = computed(() => 
  cn('h-full w-auto object-contain')
)

const textClasses = computed(() => 
  cn(
    'font-bold ui-text',
    {
      'text-lg': props.size === 'sm',
      'text-xl': props.size === 'md',
      'text-2xl': props.size === 'lg',
      'text-3xl': props.size === 'xl'
    }
  )
)
</script>
