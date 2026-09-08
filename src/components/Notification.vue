<script setup>
import { ref, computed, onMounted } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'
import Icon from './Icon.vue'

const props = defineProps({
  title: String,
  message: String,
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'success', 'warning', 'danger'].includes(value)
  },
  dismissible: {
    type: Boolean,
    default: true
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  autoClose: {
    type: Number,
    default: 0 // 0 means no auto close
  }
})

const emit = defineEmits(['dismiss'])

const visible = ref(true)

const notificationVariants = cva(
  'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-(----ui-bg) ring-opacity-5   ui-surface',
  {
    variants: {
      variant: {
        default: 'border-l-4 border-(--ui-primary)',
        success: 'border-l-4 border-(--ui-success)',
        warning: 'border-l-4 border-(--ui-warning)',
        danger: 'border-l-4 border-(--ui-danger)'
      }
    }
  }
)

const iconVariants = {
  default: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'alert-circle'
}

const iconColorVariants = cva('h-5 w-5', {
  variants: {
    variant: {
      default: 'ui-primary',
      success: 'ui-success',
      warning: 'ui-warning',
      danger: 'ui-danger'
    }
  }
})

const notificationClasses = computed(() => 
  cn(notificationVariants({ variant: props.variant }), 'p-4')
)

const iconName = computed(() => iconVariants[props.variant])
const iconClasses = computed(() => iconColorVariants({ variant: props.variant }))

const dismiss = () => {
  visible.value = false
  emit('dismiss')
}

onMounted(() => {
  if (props.autoClose > 0) {
    setTimeout(() => {
      dismiss()
    }, props.autoClose)
  }
})
</script>


<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="transform translate-x-full opacity-0"
    enter-to-class="transform translate-x-0 opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="transform translate-x-0 opacity-100"
    leave-to-class="transform translate-x-full opacity-0"
  >
    <div
      v-if="visible"
      :class="notificationClasses"
      role="alert"
      :aria-live="variant === 'danger' ? 'assertive' : 'polite'"
    >
      <div class="flex items-start space-x-3">
        <div
          v-if="showIcon"
          class="shrink-0"
        >
          <Icon
            :name="iconName"
            :class="iconClasses"
          />
        </div>
        
        <div class="flex-1 min-w-0">
          <div
            v-if="title"
            class="text-sm font-medium"
          >
            {{ title }}
          </div>
          <div
            v-if="message"
            class="text-sm"
            :class="{ 'mt-1': title }"
          >
            {{ message }}
          </div>
          <slot />
        </div>
        
        <button
          v-if="dismissible"
          class="shrink-0 rounded-md p-1.5 hover:bg-[color:color-mix(in oklab, var(----ui-bg), transparent 95%)] focus:outline-none focus:ring-2 focus:ring-offset-2"
          @click="dismiss"
        >
          <Icon
            name="x"
            class="h-4 w-4"
          />
        </button>
      </div>
    </div>
  </Transition>
</template>