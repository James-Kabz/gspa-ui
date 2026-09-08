<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'
import { useToaster } from '../lib/toast.js'
import Icon from './Icon.vue'

const props = defineProps({
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => [
      'top-left', 'top-center', 'top-right',
      'bottom-left', 'bottom-center', 'bottom-right'
    ].includes(value)
  },
  hotkey: {
    type: Array,
    default: () => ['altKey', 'KeyT']
  },
  richColors: {
    type: Boolean,
    default: true
  },
  expand: {
    type: Boolean,
    default: false
  },
  visibleToasts: {
    type: Number,
    default: 3
  },
  closeButton: {
    type: Boolean,
    default: true
  }
})

const { toasts, dismiss } = useToaster()

// Limit visible toasts
const visibleToastsList = computed(() => 
  toasts.value.slice(0, props.visibleToasts)
)

// Position classes
const positionClasses = {
  'top-left': 'top-0 left-0 flex-col items-start',
  'top-center': 'top-0 left-1/2 -translate-x-1/2 flex-col items-center',
  'top-right': 'top-0 right-0 flex-col items-end',
  'bottom-left': 'bottom-0 left-0 flex-col-reverse items-start',
  'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2 flex-col-reverse items-center',
  'bottom-right': 'bottom-0 right-0 flex-col-reverse items-end'
}

const containerClasses = computed(() =>
  cn(positionClasses[props.position])
)

// Toast styling with refined variants
const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5',
  {
    variants: {
      variant: {
        default: 'ui-surface ui-border-strong ui-text shadow-lg shadow-black/5 dark:shadow-black/30',
        info: 'border-blue-700 bg-blue-700 ui-text-inverse shadow-lg shadow-blue-900/25',
        success: 'border-green-700 bg-green-700 ui-text-inverse shadow-lg shadow-green-900/25',
        warning: 'border-amber-600 bg-amber-600 ui-text-inverse shadow-lg shadow-amber-900/25',
        error: 'border-red-700 bg-red-700 ui-text-inverse shadow-lg shadow-red-900/25',
        loading: 'ui-surface ui-border-strong ui-text shadow-lg shadow-black/5 dark:shadow-black/30'
      }
    },
    defaultVariants: { variant: 'default' }
  }
)

const toastClasses = (toast) => cn(toastVariants({ variant: toast.variant }))

// Icon mapping
const iconMap = {
  default: 'bell',
  info: 'info',
  success: 'check-circle',
  warning: 'triangle-exclamation',
  error: 'circle-xmark',
  loading: 'loader-circle'
}

// Icon color classes with refined palette
const iconColorMap = {
  default: 'ui-primary',
  info: 'text-white',
  success: 'text-white',
  warning: 'text-white',
  error: 'text-white',
  loading: 'ui-primary'
}

// Icon background classes for better visual hierarchy
const iconBackgroundMap = {
  default: 'ui-surface-muted border ui-border',
  info: 'bg-white/15 ring-1 ring-white/25',
  success: 'bg-white/15 ring-1 ring-white/25',
  warning: 'bg-white/15 ring-1 ring-white/25',
  error: 'bg-white/15 ring-1 ring-white/25',
  loading: 'ui-surface-muted border ui-border'
}

// Progress bar colors
const progressBarMap = {
  default: 'bg-(--ui-primary)',
  info: 'bg-white/70',
  success: 'bg-white/70',
  warning: 'bg-white/70',
  error: 'bg-white/70',
  loading: 'bg-(--ui-primary)'
}

// Action button colors
const actionButtonMap = {
  default: 'ui-primary hover:text-(--ui-primary-strong) underline-offset-4 hover:underline',
  info: 'text-white/90 hover:text-white underline-offset-4 hover:underline',
  success: 'text-white/90 hover:text-white underline-offset-4 hover:underline',
  warning: 'text-white/90 hover:text-white underline-offset-4 hover:underline',
  error: 'text-white/90 hover:text-white underline-offset-4 hover:underline',
  loading: 'ui-primary hover:text-(--ui-primary-strong) underline-offset-4 hover:underline'
}

const titleTextMap = {
  default: 'ui-text',
  info: 'text-white',
  success: 'text-white',
  warning: 'text-white',
  error: 'text-white',
  loading: 'ui-text'
}

const messageTextMap = {
  default: 'ui-text-muted',
  info: 'text-white/90',
  success: 'text-white/90',
  warning: 'text-white/90',
  error: 'text-white/90',
  loading: 'ui-text-muted'
}

const closeButtonMap = {
  default: 'ui-text-soft hover:bg-black/5 dark:hover:bg-white/10 hover:text-(--ui-text)',
  info: 'text-white/80 hover:text-white hover:bg-white/15',
  success: 'text-white/80 hover:text-white hover:bg-white/15',
  warning: 'text-white/80 hover:text-white hover:bg-white/15',
  error: 'text-white/80 hover:text-white hover:bg-white/15',
  loading: 'ui-text hover:bg-black/5 dark:hover:bg-white/5 hover:text-(--ui-text)'
}

const getIconName = (toast) => toast.icon || iconMap[toast.variant] || iconMap.default
const getIconClasses = (toast) => {
  const baseClasses = iconColorMap[toast.variant] || iconColorMap.default
  return toast.variant === 'loading' ? `${baseClasses} animate-spin` : baseClasses
}
const getIconBackgroundClasses = (toast) => iconBackgroundMap[toast.variant] || iconBackgroundMap.default
const getProgressBarClasses = (toast) => progressBarMap[toast.variant] || progressBarMap.default
const getActionButtonClasses = (toast) => actionButtonMap[toast.variant] || actionButtonMap.default
const getTitleTextClasses = (toast) => titleTextMap[toast.variant] || titleTextMap.default
const getMessageTextClasses = (toast) => messageTextMap[toast.variant] || messageTextMap.default
const getCloseButtonClasses = (toast) => closeButtonMap[toast.variant] || closeButtonMap.default

const showIcon = (toast) => toast.icon !== false
const isDismissible = (toast) => toast.dismissible !== false && (toast.closeButton || props.closeButton || toast.dismissible)
</script>

<template>
  <Teleport to="body">
    <div
      :class="cn(
        containerClasses,
        'fixed z-[10000] flex max-h-screen w-full p-4 md:max-w-[420px] pointer-events-none'
      )"
    >
      <TransitionGroup
        enter-active-class="transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
        enter-from-class="transform translate-x-full opacity-0 scale-90"
        enter-to-class="transform translate-x-0 opacity-100 scale-100"
        leave-active-class="transition-all duration-300 ease-[cubic-bezier(0.4,0,1,1)]"
        leave-from-class="transform translate-x-0 opacity-100 scale-100"
        leave-to-class="transform translate-x-full opacity-0 scale-90"
        move-class="transition-all duration-300 ease-out"
        tag="div"
        class="w-full space-y-3"
      >
        <div
          v-for="toast in visibleToastsList"
          :key="toast.id"
          :class="toastClasses(toast)"
          role="alert"
          :aria-live="toast.variant === 'error' ? 'assertive' : 'polite'"
        >
          <!-- Icon with animated background glow -->
          <div
            v-if="showIcon(toast)"
            :class="cn(
              'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300',
              getIconBackgroundClasses(toast)
            )"
          >
            <Icon
              :icon="getIconName(toast)"
              :class="cn(
                'h-5 w-5 transition-transform duration-300 group-hover:scale-110',
                getIconClasses(toast)
              )"
            />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 pt-0.5">
            <div
              v-if="toast.title"
              :class="cn('text-md font-semibold leading-tight mb-1', getTitleTextClasses(toast))"
            >
              {{ toast.title }}
            </div>
            <div
              v-if="toast.message || toast.description"
              :class="cn('text-md leading-relaxed', getMessageTextClasses(toast))"
            >
              {{ toast.message || toast.description }}
            </div>

            <!-- Custom component slot -->
            <component
              :is="toast.component"
              v-if="toast.component"
              v-bind="toast.componentProps"
              class="mt-3"
            />

            <!-- Action Button -->
            <button
              v-if="toast.action"
              class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
              :class="getActionButtonClasses(toast)"
              @click="toast.action.onClick"
            >
              {{ toast.action.label }}
              <Icon
                icon="arrow-right"
                class="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>
          </div>

          <!-- Close Button -->
          <button
            v-if="isDismissible(toast)"
            :class="cn(
              'absolute right-2 top-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-md opacity-70 transition-all hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-(--ui-ring)',
              getCloseButtonClasses(toast)
            )"
            aria-label="Dismiss"
            @click="dismiss(toast.id)"
          >
            <Icon
              icon="x"
              class="h-4 w-4"
            />
          </button>

          <!-- Progress bar for auto-dismiss -->
          <div
            v-if="toast.duration && toast.duration > 0"
            class="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden"
          >
            <div
              :class="cn(
                'h-full origin-left animate-toast-progress',
                getProgressBarClasses(toast)
              )"
              :style="{ animationDuration: `${toast.duration}ms` }"
            />
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>


<style scoped>
@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

.animate-toast-progress {
  animation: toast-progress linear forwards;
}
</style>
