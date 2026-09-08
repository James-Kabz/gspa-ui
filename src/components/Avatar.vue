<template>
  <div :class="avatarClasses">
    <img 
      v-if="src" 
      :src="src" 
      :alt="alt" 
      :class="imageClasses"
      @error="handleImageError"
    >
    <span
      v-else-if="initials"
      :class="initialsClasses"
    >
      {{ initials }}
    </span>
    <Icon
      v-else
      name="user"
      :class="iconClasses"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'
import Icon from './Icon.vue'

const props = defineProps({
  src: String,
  alt: String,
  initials: String,
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'outline'].includes(value)
  },
  class: String
})

const imageError = ref(false)

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
      },
      variant: {
        default: 'bg-muted',
        outline: 'border-2 ui-border-strong  ui-surface '
      }
    }
  }
)

const avatarClasses = computed(() => 
  cn(avatarVariants({ size: props.size, variant: props.variant }), props.class)
)

const imageClasses = computed(() => 'aspect-square h-full w-full object-cover')

const initialsClasses = computed(() => 
  cn(
    'flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground',
    {
      'text-xs': props.size === 'xs',
      'text-sm': props.size === 'sm',
      'text-base': props.size === 'md',
      'text-lg': props.size === 'lg',
      'text-xl': props.size === 'xl'
    }
  )
)

const iconClasses = computed(() => 
  cn('h-4 w-4 text-muted-foreground', {
    'h-3 w-3': props.size === 'xs',
    'h-4 w-4': props.size === 'sm' || props.size === 'md',
    'h-5 w-5': props.size === 'lg',
    'h-6 w-6': props.size === 'xl'
  })
)

const handleImageError = () => {
  imageError.value = true
}
</script>
