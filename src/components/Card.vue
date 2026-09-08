<template>
  <component
    :is="as"
    :class="cn(cardVariants({ variant, padding, hoverable, clickable, loading, bordered }))"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :aria-disabled="disabled"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable && !disabled ? 0 : undefined"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 bg-[color:color-mix(in oklab, var(--ui-surface), transparent 40%)] backdrop-blur-sm flex items-center justify-center z-10"
      aria-hidden="true"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 ui-border-strong" />
    </div>

    <!-- Header -->
    <div
      v-if="$slots.header || title || subtitle || $slots.actions"
      :class="cn(headerVariants({ padding, hasBorder: !!($slots.default || $slots.footer) }))"
    >
      <slot name="header">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <component
              :is="titleTag"
              v-if="title"
              :class="cn(titleClasses, titleSize)"
            >
              {{ title }}
            </component>
            <p
              v-if="subtitle"
              :class="subtitleClasses"
            >
              {{ subtitle }}
            </p>
          </div>

          <div
            v-if="$slots.actions"
            class="shrink-0"
          >
            <slot name="actions" />
          </div>
        </div>
      </slot>
    </div>

    <!-- Image -->
    <div
      v-if="$slots.image || image"
      :class="cn(imageContainerVariants({ padding, hasHeader: !!($slots.header || title) }))"
    >
      <slot name="image">
        <img
          v-if="image"
          :src="image"
          :alt="imageAlt"
          :class="cn(imageClasses, imageAspect)"
          :loading="imageLazy ? 'lazy' : 'eager'"
        >
      </slot>
    </div>

    <!-- Content -->
    <template v-if="$slots.default">
      <div
        v-if="contentWrapper"
        :class="cn(contentVariants({ padding }), contentClass)"
      >
        <slot />
      </div>
      <slot v-else />
    </template>

    <!-- Footer -->
    <div
      v-if="$slots.footer"
      :class="cn(footerVariants({ padding }))"
    >
      <slot name="footer" />
    </div>

    <!-- Badge -->
    <div
      v-if="badge"
      class="absolute top-3 right-3"
    >
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ui-bg ui-text">
        {{ badge }}
      </span>
    </div>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

const props = defineProps({
  // Component type
  as: {
    type: String,
    default: 'div'
  },
  
  // Styling variants
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'outlined', 'elevated', 'filled', 'ghost'].includes(value)
  },
  padding: {
    type: String,
    default: 'none',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  bordered: {
    type: Boolean,
    default: true
  },
  
  // Content props
  title: String,
  titleTag: {
    type: String,
    default: 'h3'
  },
  titleSize: {
    type: String,
    default: 'default',
    validator: (value) => ['sm', 'default', 'lg', 'xl'].includes(value)
  },
  subtitle: String,
  badge: String,
  contentClass: {
    type: [String, Array, Object],
    default: ''
  },
  contentWrapper: {
    type: Boolean,
    default: true
  },
  
  // Image props
  image: String,
  imageAlt: {
    type: String,
    default: 'Card image'
  },
  imageAspect: {
    type: String,
    default: 'auto',
    validator: (value) => ['auto', 'video', 'square', 'portrait'].includes(value)
  },
  imageLazy: {
    type: Boolean,
    default: true
  },
  
  // Interaction states
  hoverable: Boolean,
  clickable: Boolean,
  disabled: Boolean,
  loading: Boolean
})

const emit = defineEmits(['click'])

const textControlRoles = new Set(['textbox', 'searchbox', 'combobox', 'spinbutton'])

const isInteractiveTarget = (target) => {
  if (!(target instanceof Element)) return false

  if (target.closest('input, textarea, select, button, a, [contenteditable], [contenteditable="true"]')) {
    return true
  }

  const role = target.getAttribute('role')
  return role ? textControlRoles.has(role) : false
}

const handleClick = (event) => {
  if (props.clickable && !props.disabled && !props.loading) {
    emit('click', event)
  }
}

const handleKeydown = (event) => {
  if (!props.clickable || props.disabled || props.loading) return
  if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return
  if (isInteractiveTarget(event.target)) return
  if (event.currentTarget !== event.target) return

  event.preventDefault()
  handleClick(event)
}

/* --- Computed Classes --- */
const titleSize = computed(() => {
  const sizes = {
    sm: 'text-base',
    default: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  }
  return sizes[props.titleSize]
})

const imageAspect = computed(() => {
  const aspects = {
    auto: '',
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]'
  }
  return aspects[props.imageAspect]
})

/* --- Variants --- */
const cardVariants = cva(
  'rounded-lg overflow-hidden transition-all duration-200 relative ui-text',
  {
    variants: {
      variant: {
        default: 'ui-surface',
        outlined: 'ui-surface',
        elevated: 'ui-surface shadow-md',
        filled: 'ui-surface-soft',
        ghost: 'bg-transparent'
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8'
      },
      bordered: {
        true: '',
        false: ''
      },
      hoverable: {
        true: 'hover:shadow-lg hover:scale-[1.02]'
      },
      clickable: {
        true: 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-(--ui-ring) focus:ring-offset-2'
      },
      loading: {
        true: ''
      }
    },
    compoundVariants: [
      {
        variant: 'default',
        bordered: true,
        class: 'border ui-border-strong'
      },
      {
        variant: 'outlined',
        bordered: true,
        class: 'border-2 ui-border-strong'
      },
      {
        variant: 'elevated',
        bordered: true,
        class: 'border ui-border-strong'
      },
      {
        variant: 'filled',
        bordered: true,
        class: 'border ui-border-strong'
      },
      {
        clickable: true,
        hoverable: false,
        class: 'hover:bg-(--ui-surface)'
      }
    ],
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      bordered: true
    }
  }
)

const headerVariants = cva('', {
  variants: {
    padding: {
      none: 'p-4 pb-3',
      sm: 'px-3 pt-3 pb-2',
      md: 'px-4 pt-4 pb-3',
      lg: 'px-6 pt-6 pb-4',
      xl: 'px-8 pt-8 pb-6'
    },
    hasBorder: {
      true: 'border-b ui-border-strong mb-0',
      false: ''
    }
  }
})

const contentVariants = cva('', {
  variants: {
    padding: {
      none: 'p-4',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8'
    }
  }
})

const footerVariants = cva('border-t ui-border-strong bg-[color:color-mix(in oklab, var(--ui-surface), transparent 50%)]', {
  variants: {
    padding: {
      none: 'p-4 pt-3',
      sm: 'px-3 pb-3 pt-2',
      md: 'px-4 pb-4 pt-3',
      lg: 'px-6 pb-6 pt-4',
      xl: 'px-8 pb-8 pt-6'
    }
  }
})

const imageContainerVariants = cva('overflow-hidden', {
  variants: {
    padding: {
      none: '',
      sm: '-mx-3 mb-3',
      md: '-mx-4 mb-4',
      lg: '-mx-6 mb-6',
      xl: '-mx-8 mb-8'
    },
    hasHeader: {
      true: '',
      false: ''
    }
  },
  compoundVariants: [
    {
      hasHeader: true,
      padding: 'sm',
      class: '-mt-3'
    },
    {
      hasHeader: true,
      padding: 'md',
      class: '-mt-4'
    },
    {
      hasHeader: true,
      padding: 'lg',
      class: '-mt-6'
    },
    {
      hasHeader: true,
      padding: 'xl',
      class: '-mt-8'
    }
  ]
})

/* --- Static classes --- */
const imageClasses = 'w-full h-full object-cover'
const titleClasses = 'font-semibold ui-text line-clamp-2'
const subtitleClasses = 'text-sm ui-text mt-1 line-clamp-2'
</script>
