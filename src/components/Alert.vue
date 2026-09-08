<template>
  <Transition
    enter-active-class="transition-all duration-300"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-200"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="visible"
      :class="cn(alertVariants({ variant }), $attrs.class)"
      role="alert"
    >
      <div class="flex items-start gap-3">
        <!-- Icon -->
        <div
          v-if="showIcon"
          class="shrink-0 mt-0.5"
        >
          <component
            :is="iconComponent"
            :class="iconClasses"
          />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <h4
            v-if="title"
            class="font-medium text-sm mb-1"
          >
            {{ title }}
          </h4>

          <div :class="['text-sm', { 'mt-0': !title, 'mt-1': title }]">
            <slot>{{ message }}</slot>
          </div>

          <!-- Actions -->
          <div
            v-if="$slots.actions || actions.length > 0"
            class="mt-3 flex gap-2"
          >
            <slot name="actions">
              <Button
                v-for="action in actions"
                :key="action.label"
                :variant="action.variant || 'outline'"
                :size="action.size || 'sm'"
                @click="handleActionClick(action)"
              >
                {{ action.label }}
              </Button>
            </slot>
          </div>
        </div>

        <!-- Dismiss button -->
        <button
          v-if="dismissible"
          :class="dismissButtonClasses"
          :aria-label="dismissLabel"
          @click="handleDismiss"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'
import Button from './Button.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  variant: {
    type: String,
    default: 'info',
    validator: (value) =>
      ['info', 'success', 'warning', 'error', 'default', 'danger'].includes(
        value
      )
  },
  title: String,
  message: String,
  dismissible: { type: Boolean, default: false },
  dismissLabel: { type: String, default: 'Dismiss alert' },
  showIcon: { type: Boolean, default: true },
  actions: { type: Array, default: () => [] },
  autoClose: { type: [Boolean, Number], default: false }
})

const emit = defineEmits(['dismiss', 'action'])

const visible = ref(true)
const handleDismiss = () => {
  visible.value = false
  emit('dismiss')
}
const handleActionClick = (action) => {
  emit('action', action)
  if (action.onClick) action.onClick()
}

// Auto close
if (props.autoClose) {
  const delay = typeof props.autoClose === 'number' ? props.autoClose : 5000
  setTimeout(handleDismiss, delay)
}

/* ===== Icons ===== */
const InfoIcon = {
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M12 9v2m0 4h.01M21 12A9 9 0 1112 3a9 9 0 019 9z'
      })
    ])
  }
}

const CheckCircleIcon = {
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z'
      })
    ])
  }
}

const ExclamationTriangleIcon = {
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a1.5 1.5 0 001.29 2.25h18.78a1.5 1.5 0 001.29-2.25L13.71 3.86a1.5 1.5 0 00-2.42 0z'
      })
    ])
  }
}

const XCircleIcon = {
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0a9 9 0 0118 0z'
      })
    ])
  }
}

const XMarkIcon = {
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M6 18L18 6M6 6l12 12'
      })
    ])
  }
}


const iconComponent = computed(() => {
  const icons = {
    info: InfoIcon,
    success: CheckCircleIcon,
    warning: ExclamationTriangleIcon,
    error: XCircleIcon,
    default: InfoIcon,
    danger: XCircleIcon
  }
  return icons[props.variant]
})

/* ===== Variants with CVA ===== */
const alertVariants = cva(
  'relative w-full rounded-lg border p-4 flex items-start gap-3  ',
  {
    variants: {
      variant: {
        default: 'ui-surface ui-text ',
        danger: 'ui-danger-soft ui-danger',
        info: 'ui-primary-soft ui-primary',
        success: 'ui-success-soft ui-success',
        warning: 'ui-warning-soft ui-warning',
        error: 'ui-danger-soft ui-danger'
      }
    },
    defaultVariants: { variant: 'default' }
  }
)

const iconClasses = computed(() => {
  const colors = {
    info: 'ui-primary',
    success: 'ui-success',
    warning: 'ui-warning',
    error: 'ui-danger',
    default: 'ui-text',
    danger: 'ui-danger'
  }
  return ['w-5 h-5', colors[props.variant]]
})

const dismissButtonClasses = computed(() => {
  const colors = {
    info: 'ui-primary hover:text-(--ui-primary) hover:bg-(--ui-primary-soft)',
    success: 'ui-success hover:text-(--ui-success) hover:bg-(--ui-success-soft)',
    warning: 'ui-warning hover:text-(--ui-warning) hover:bg-(--ui-warning-soft)',
    error: 'ui-danger hover:text-(--ui-danger) hover:bg-(--ui-danger-soft)',
    default: 'ui-text hover:text-(--ui-text) hover:bg-(--ui-surface)',
    danger:
      'ui-danger hover:text-(--ui-danger) hover:bg-(--ui-danger-soft)'
  }
  return ['shrink-0 p-1 rounded-md transition-colors duration-200', colors[props.variant]]
})
</script>
