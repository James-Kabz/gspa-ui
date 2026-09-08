<template>
  <div
    v-if="title || description || $slots.header"
    :class="headerClasses"
  >
    <slot name="header">
      <div class="flex items-start justify-between">
        <div>
          <Typography
            v-if="title"
            :class="titleClasses"
          >
            {{ title }}
          </Typography>
          <Typography
            v-if="description"
            :class="descriptionClasses"
          >
            {{ description }}
          </Typography>
        </div>
        
        <div
          v-if="$slots.filters"
          class="flex items-center gap-2"
        >
          <slot name="filters" />
        </div>
      </div>
    </slot>
  </div>
</template>

<script setup>
import Typography from './Typography.vue'
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

const props = defineProps({
  title: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'minimal', 'bordered'].includes(value)
  },
  padding: {
    type: String,
    default: 'normal',
    validator: (value) => ['compact', 'normal', 'comfortable'].includes(value)
  }
})

const headerVariants = cva('border ui-border-strong rounded-2xl', {
  variants: {
    variant: {
      default: 'ui-border-strong',
      minimal: 'bg-transparent border-none',
      bordered: 'border-2 ui-border-strong'
    },
    padding: {
      compact: 'px-4 py-2',
      normal: 'px-6 py-4',
      comfortable: 'px-8 py-6'
    }
  },
  defaultVariants: {
    variant: 'default',
    padding: 'normal'
  }
})

const titleVariants = cva('font-semibold ui-text', {
  variants: {
    size: {
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl'
    }
  },
  defaultVariants: {
    size: 'md'
  }
})

const descriptionVariants = cva('ui-text mt-1', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    }
  },
  defaultVariants: {
    size: 'md'
  }
})

const headerClasses = computed(() => 
  cn(headerVariants({ 
    variant: props.variant, 
    padding: props.padding 
  }))
)

const titleClasses = computed(() => 
  cn(titleVariants({ size: 'md' }))
)

const descriptionClasses = computed(() => 
  cn(descriptionVariants({ size: 'md' }))
)
</script>
