<template>
  <header
    :class="cn(
      cardHeaderVariants({ size }),
      'ui-text',
      $attrs.class
    )"
  >
    <div :class="cn(contentVariants({ alignment }), 'flex flex-col')">
      <h2
        v-if="title || $slots.title"
        class="ui-text"
      >
        <slot name="title">
          {{ title }}
        </slot>
      </h2>
      <p
        v-if="subtitle || $slots.description"
        class="ui-text"
      >
        <slot name="description">
          {{ subtitle }}
        </slot>
      </p>
    </div>

    <div v-if="$slots.actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup>
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

defineOptions({ inheritAttrs: false })

defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  alignment: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'center', 'right'].includes(value)
  }
})

const cardHeaderVariants = cva(
  'flex items-center justify-between',
  {
    variants: {
      size: {
        small: 'p-2',
        medium: 'p-4',
        large: 'p-6'
      }
    },
    defaultVariants: {
      size: 'medium'
    }
  }
)

const contentVariants = cva(
  '',
  {
    variants: {
      alignment: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
      }
    },
    defaultVariants: {
      alignment: 'left'
    }
  }
)
</script>
