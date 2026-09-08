<template>
  <div
    ref="triggerRef"
    class="relative inline-block"
    @mouseenter="show"
    @mouseleave="hide"
  >
    <slot />
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isVisible"
          ref="tooltipRef"
          :class="tooltipClasses"
          :style="tooltipStyle"
          role="tooltip"
        >
          {{ content }}
          <div :class="arrowClasses" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  placement: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value)
  },
  delay: {
    type: Number,
    default: 0
  },
  class: String
})

const isVisible = ref(false)
const triggerRef = ref(null)
const tooltipRef = ref(null)
const tooltipStyle = ref({})
let timeoutId = null

const tooltipVariants = cva(
  'fixed z-[9999] px-3 py-1.5 text-sm ui-text ui-surface rounded-md shadow-lg pointer-events-none whitespace-nowrap',
  {
    variants: {
      placement: {
        top: '',
        bottom: '',
        left: '',
        right: ''
      }
    }
  }
)

const arrowVariants = cva(
  'absolute w-2 h-2 bg-primary transform rotate-45',
  {
    variants: {
      placement: {
        top: 'top-full left-1/2 transform -translate-x-1/2 -mt-1',
        bottom: 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1',
        left: 'left-full top-1/2 transform -translate-y-1/2 -ml-1',
        right: 'right-full top-1/2 transform -translate-y-1/2 -mr-1'
      }
    }
  }
)

const tooltipClasses = computed(() => 
  cn(tooltipVariants({ placement: props.placement }), props.class)
)

const arrowClasses = computed(() => 
  arrowVariants({ placement: props.placement })
)

const updatePosition = () => {
  if (!triggerRef.value || !tooltipRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  
  let top = 0
  let left = 0
  const offset = 8 // Distance from trigger element

  switch (props.placement) {
    case 'top':
      top = triggerRect.top - tooltipRect.height - offset
      left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
      break
    case 'bottom':
      top = triggerRect.bottom + offset
      left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
      break
    case 'left':
      top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
      left = triggerRect.left - tooltipRect.width - offset
      break
    case 'right':
      top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
      left = triggerRect.right + offset
      break
  }

  // Keep tooltip within viewport
  const padding = 8
  if (left < padding) left = padding
  if (left + tooltipRect.width > window.innerWidth - padding) {
    left = window.innerWidth - tooltipRect.width - padding
  }
  if (top < padding) top = padding
  if (top + tooltipRect.height > window.innerHeight - padding) {
    top = window.innerHeight - tooltipRect.height - padding
  }

  tooltipStyle.value = {
    top: `${top}px`,
    left: `${left}px`
  }
}

const show = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  
  timeoutId = setTimeout(async () => {
    isVisible.value = true
    await nextTick()
    updatePosition()
  }, props.delay)
}

const hide = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  
  isVisible.value = false
}
</script>
