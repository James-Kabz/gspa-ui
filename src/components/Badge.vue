<template>
  <span :class="cn(badgeVariants({ variant, size, shape }), $attrs.class)">
    <!-- Icon -->
    <component
      :is="icon"
      v-if="icon"
      :class="iconClasses"
    />

    <!-- Default slot -->
    <slot />

    <!-- Dismiss button -->
    <button
      v-if="dismissible"
      class="ml-1 hover:bg-[color:color-mix(in oklab, var(--ui-bg), transparent 90%)] rounded-full p-0.5 transition-colors"
      :aria-label="dismissLabel"
      @click="handleDismiss"
    >
      <Icon
        icon="circle-xmark"
        class="w-3 h-3"
      />
    </button>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'
import Icon from './Icon.vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) =>
      ['default', 'secondary', 'danger', 'primary', 'outline', 'success', 'warning', 'info', 'ghost', 'link', 'subtle', 'dark', 'light', 'primaryOutline', 'dangerOutline', 'successOutline', 'gradient'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  shape: {
    type: String,
    default: 'rounded',
    validator: (value) => ['rounded', 'pill', 'square'].includes(value)
  },
  icon: {
    type: [String, Object],
    default: null
  },
  dismissible: {
    type: Boolean,
    default: false
  },
  dismissLabel: {
    type: String,
    default: 'Dismiss'
  }
})

const emit = defineEmits(['dismiss'])
const handleDismiss = () => emit('dismiss')

// cva-powered class variants
const badgeVariants = cva(
  'inline-flex items-center font-medium border transition-all duration-200',
  {
    variants: {
      variant: {
        default:
          'border border-(--ui-primary-soft) ui-primary-soft ui-primary hover:bg-(--ui-primary-soft) dark:border-(--ui-primary-soft) dark:bg-(--ui-primary-soft) dark:text-(--ui-primary)',
        secondary:
          'border ui-border-strong ui-surface-muted ui-text hover:bg-(--ui-surface) dark:border-(--ui-border-strong) dark:bg-(--ui-surface) dark:text-(--ui-text)',
        danger:
          'border border-(--ui-danger-soft) ui-danger-soft ui-danger hover:bg-(--ui-danger-soft) dark:border-(--ui-danger-soft) dark:bg-(--ui-danger-soft) dark:text-(--ui-danger)',
        primary:
          'border border-(--ui-primary-soft) ui-primary-soft ui-primary hover:bg-(--ui-primary-soft) dark:border-(--ui-primary-soft) dark:bg-(--ui-primary-soft) dark:text-(--ui-primary)',
        outline: 'ui-text border',
        success:
          'border border-(--ui-success-soft) ui-success-soft ui-success dark:border-(--ui-success-soft) dark:bg-(--ui-success-soft) dark:text-(--ui-success)',
        warning:
          'border border-(--ui-warning-soft) ui-warning-soft ui-warning hover:bg-(--ui-warning-soft) dark:border-(--ui-warning-soft) dark:bg-(--ui-warning-soft) dark:text-(--ui-warning)',
        info:
          'border border-(--ui-primary-soft) ui-primary-soft ui-primary hover:bg-(--ui-primary-soft) dark:border-(--ui-primary-soft) dark:bg-(--ui-primary-soft) dark:text-(--ui-primary)',
        ghost:
          'bg-transparent ui-text hover:bg-(--ui-surface)',
        link:
          'ui-primary hover:underline',
        subtle:
          'ui-surface-muted ui-text hover:bg-(--ui-bg)',
        dark:
          'ui-bg ui-text hover:bg-(--ui-bg)',
        light:
          'ui-surface-muted ui-text border ui-border-strong hover:bg-(--ui-surface)',
        primaryOutline:
          'border border-(--ui-primary) ui-primary bg-transparent hover:bg-(--ui-primary-soft)',
        dangerOutline:
          'border border-(--ui-danger) ui-danger bg-transparent hover:bg-(--ui-danger-soft)',
        successOutline:
          'border border-(--ui-success) ui-success bg-transparent hover:bg-(--ui-success-soft)',
        gradient:
          'bg-linear-to-r from-(--ui-primary-soft) to-(--ui-accent) ui-text hover:from-(--ui-primary) hover:to-(--ui-accent)',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base'
      },
      shape: {
        rounded: 'rounded-md',
        pill: 'rounded-full',
        square: 'rounded-none'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      shape: 'rounded'
    }
  }
)

// Computed icon sizing
const iconClasses = computed(() => {
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  return ['mr-1', iconSizes[props.size]]
})
</script>
