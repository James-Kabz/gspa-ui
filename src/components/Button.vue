<script setup>
import { computed, inject } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'
import Icon from './Icon.vue'
import { AUTH_RESOLVER_KEY } from '../lib/auth.js'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) =>
      [
        'primary',
        'default',
        'danger',
        'outline',
        'secondary',
        'ghost',
        'link',
        'success',
        'warning',
        'info',
        'subtle',
        'dark',
        'light',
        'primaryOutline',
        'dangerOutline',
        'successOutline',
        'gradient',
      ].includes(value),
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) =>
      ['2xs', 'xs', 'sm', 'default', 'md', 'lg', 'xl', '2xl', 'icon-sm', 'icon', 'icon-lg'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingText: {
    type: String,
    default: null,
  },
  icon: {
    type: String,
    default: null,
  },
  permission: {
    type: [String, Array, Boolean, Function],
    default: null,
  },
  role: {
    type: [String, Array, Boolean, Function],
    default: null,
  },
  requireAll: {
    type: Boolean,
    default: false,
  },
  unauthorized: {
    type: String,
    default: 'show',
    validator: (value) => ['show', 'hide', 'disable'].includes(value),
  },
})

const authResolver = inject(AUTH_RESOLVER_KEY, null)

const normalizeRule = (rule) => {
  if (rule === null || rule === undefined) return null
  if (typeof rule === 'boolean') return rule
  if (typeof rule === 'function') return !!rule()
  return rule
}

const hasAccess = computed(() => {
  const normalizedPermission = normalizeRule(props.permission)
  const normalizedRole = normalizeRule(props.role)

  // No access requirements configured
  if (normalizedPermission === null && normalizedRole === null) return true

  // Direct boolean/function outcome path
  const isBooleanOnly =
    (normalizedPermission === null || typeof normalizedPermission === 'boolean') &&
    (normalizedRole === null || typeof normalizedRole === 'boolean')

  if (isBooleanOnly) {
    return (normalizedPermission ?? true) && (normalizedRole ?? true)
  }

  // Delegate string/array checks to injected resolver
  if (typeof authResolver === 'function') {
    return !!authResolver({
      permission: normalizedPermission,
      role: normalizedRole,
      requireAll: props.requireAll,
    })
  }

  // Fallback: keep visible when resolver isn't configured.
  return true
})

const shouldHide = computed(() => props.unauthorized === 'hide' && !hasAccess.value)

const isUnauthorizedDisabled = computed(() => {
  return props.unauthorized === 'disable' && !hasAccess.value
})

const isDisabled = computed(() => {
  return props.disabled || props.loading || isUnauthorizedDisabled.value
})

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-primary) focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'ui-primary-bg shadow-sm hover:bg-(--ui-primary-strong) hover:shadow-md',
        default:
          'ui-primary-bg shadow-sm hover:bg-(--ui-primary-strong) hover:shadow-md',
        danger:
          'ui-danger-bg shadow-sm hover:bg-(--ui-danger-strong) hover:shadow-md',
        outline:
          'border ui-border-strong ui-surface ui-text hover:bg-(--ui-surface-soft) hover:border-(--ui-primary) hover:text-(--ui-primary)',
        secondary:
          'border ui-border ui-surface-muted ui-text hover:bg-(--ui-surface-soft) hover:shadow-sm',
        ghost:
          'bg-transparent ui-text-muted hover:bg-[color:color-mix(in oklab, var(--ui-accent-soft), transparent 40%)] hover:text-(--ui-text)',
        link:
          'ui-primary underline-offset-4 hover:underline hover:text-(--ui-primary-strong)',
        success:
          'ui-success-bg shadow-sm hover:bg-(--ui-success-strong) hover:shadow-md',
        warning:
          'ui-warning-bg shadow-sm hover:bg-(--ui-warning-strong) hover:shadow-md',
        info:
          'border border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md dark:border-blue-500 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-400',
        subtle:
          'border ui-border ui-surface ui-text-muted hover:text-(--ui-text) hover:bg-(--ui-surface-soft)',
        dark:
          'border border-zinc-900 bg-zinc-900 text-white shadow-sm hover:bg-black hover:shadow-md dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white',
        light:
          'border border-zinc-200 bg-white text-zinc-900 shadow-sm hover:bg-zinc-50 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
        primaryOutline:
          'border border-(--ui-primary) ui-primary bg-transparent hover:bg-(--ui-primary-soft) hover:border-(--ui-primary-strong) hover:text-(--ui-primary-strong)',
        dangerOutline:
          'border border-(--ui-danger) ui-danger bg-transparent hover:bg-(--ui-danger-soft) hover:border-(--ui-danger-strong) hover:text-(--ui-danger-strong)',
        successOutline:
          'border border-(--ui-success) ui-success bg-transparent hover:bg-(--ui-success-soft) hover:border-(--ui-success-strong) hover:text-(--ui-success-strong)',
        gradient:
          'bg-linear-to-r from-(--ui-primary) to-(--ui-accent) ui-text-inverse shadow-sm hover:from-(--ui-primary-strong) hover:to-(--ui-accent-strong) hover:shadow-md',
      },
      size: {
        '2xs': 'h-4 px-1 py-3 text-md rounded',
        'xs': 'h-7 px-2.5 py-1 text-xs rounded-md',
        'sm': 'h-8 px-3 py-1.5 text-sm rounded-md',
        'default': 'h-9 px-4 py-2 text-sm rounded-md',
        'md': 'h-10 px-4 py-2 text-sm rounded-md',
        'lg': 'h-11 px-6 py-2.5 text-base rounded-md',
        'xl': 'h-12 px-8 py-3 text-base rounded-lg',
        '2xl': 'h-14 px-10 py-3.5 text-lg rounded-lg',
        'icon-sm': 'h-8 w-8 p-0',
        'icon': 'h-10 w-10 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// Dynamic icon sizing based on button size
const iconSizeClass = computed(() => {
  const sizeMap = {
    '2xs': 'h-3 w-3',
    'xs': 'h-3.5 w-3.5',
    'sm': 'h-4 w-4',
    'default': 'h-4 w-4',
    'md': 'h-4 w-4',
    'lg': 'h-5 w-5',
    'xl': 'h-5 w-5',
    '2xl': 'h-6 w-6',
    'icon-sm': 'h-4 w-4',
    'icon': 'h-5 w-5',
    'icon-lg': 'h-6 w-6',
  }
  return sizeMap[props.size] || 'h-4 w-4'
})

// Dynamic spinner sizing based on button size
const spinnerSizeClass = computed(() => {
  const sizeMap = {
    '2xs': 'h-3 w-3',
    'xs': 'h-3.5 w-3.5',
    'sm': 'h-4 w-4',
    'default': 'h-4 w-4',
    'md': 'h-4 w-4',
    'lg': 'h-5 w-5',
    'xl': 'h-5 w-5',
    '2xl': 'h-6 w-6',
    'icon-sm': 'h-4 w-4',
    'icon': 'h-5 w-5',
    'icon-lg': 'h-6 w-6',
  }
  return sizeMap[props.size] || 'h-4 w-4'
})
</script>

<template>
  <button
    v-if="!shouldHide"
    :class="cn(buttonVariants({ variant, size }), $attrs.class)"
    :disabled="isDisabled"
    :aria-disabled="isDisabled"
    :aria-busy="loading"
    v-bind="$attrs"
  >
    <!-- Loading Spinner -->
    <svg
      v-if="loading"
      :class="spinnerSizeClass"
      class="animate-spin mr-2 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-width="4"
        d="M4 12a8 8 0 018-8"
      />
    </svg>

    <!-- Icon component (only show if not loading) -->
    <Icon
      v-if="icon && !loading"
      :icon="icon"
      :class="iconSizeClass"
    />

    <!-- Button content -->
    <span v-if="loading && loadingText">{{ loadingText }}</span>
    <slot v-else />
  </button>
</template>
