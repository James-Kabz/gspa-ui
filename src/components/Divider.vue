<template>
  <div
    :class="cn(dividerVariants({ orientation, size, color }), { 'opacity-50': faded }, customSpacing)"
  >
    <span
      v-if="label && orientation === 'horizontal'"
      class="px-3 text-sm ui-text ui-surface  dark:bg-(----ui-bg) dark:text-(--ui-text) relative z-10"
    >
      {{ label }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

const props = defineProps({
  orientation: {
    type: String,
    default: 'horizontal',
    validator: (value) => ['horizontal', 'vertical'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  color: {
    type: String,
    default: 'gray',
    validator: (value) => ['gray', 'primary', 'secondary'].includes(value)
  },
  faded: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: null
  },
  spacing: {
    type: String,
    default: null
  }
})

const dividerVariants = cva('divider relative flex items-center', {
  variants: {
    orientation: {
      horizontal: 'w-full h-px flex items-center',
      vertical: 'h-full w-px'
    },
    size: {
      sm: '',
      md: '',
      lg: ''
    },
    color: {
      gray: 'ui-bg dark:bg-(--ui-bg)',
      primary: 'ui-primary-bg',
      secondary: 'ui-bg'
    }
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      size: 'sm',
      class: 'my-2'
    },
    {
      orientation: 'horizontal',
      size: 'md',
      class: 'my-4'
    },
    {
      orientation: 'horizontal',
      size: 'lg',
      class: 'my-6'
    },
    {
      orientation: 'vertical',
      size: 'sm',
      class: 'mx-2'
    },
    {
      orientation: 'vertical',
      size: 'md',
      class: 'mx-4'
    },
    {
      orientation: 'vertical',
      size: 'lg',
      class: 'mx-6'
    }
  ],
  defaultVariants: {
    orientation: 'horizontal',
    size: 'md',
    color: 'gray'
  }
})

const customSpacing = computed(() => (props.spacing ? props.spacing : ''))
</script>
