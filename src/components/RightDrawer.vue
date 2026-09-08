<script setup>
import { computed, onUnmounted, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Details'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value)
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  },
  closeOnEsc: {
    type: Boolean,
    default: true
  },
  showOverlay: {
    type: Boolean,
    default: true
  },
  showCloseButton: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const sizeClass = computed(() => {
  const sizeMap = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
    xl: 'w-full max-w-xl',
    full: 'w-full max-w-full'
  }
  return sizeMap[props.size] || sizeMap.md
})

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const onOverlayClick = () => {
  if (props.closeOnOverlay) close()
}

const onEsc = (event) => {
  if (event.key === 'Escape' && props.modelValue && props.closeOnEsc) {
    close()
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (typeof window === 'undefined') return
    if (isOpen) {
      window.addEventListener('keydown', onEsc)
    } else {
      window.removeEventListener('keydown', onEsc)
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
  if (typeof window !== 'undefined') window.removeEventListener('keydown', onEsc)
})
</script>

<template>
  <transition
    enter-active-class="transition-opacity duration-200 ease-out"
    leave-active-class="transition-opacity duration-200 ease-in"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[1200]"
    >
      <div
        v-if="showOverlay"
        class="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        @click="onOverlayClick"
      />

      <transition
        enter-active-class="transition-transform duration-250 ease-out"
        leave-active-class="transition-transform duration-200 ease-in"
        enter-from-class="translate-x-full"
        leave-to-class="translate-x-full"
      >
        <aside
          v-if="modelValue"
          :class="[
            'absolute right-0 top-0 h-full ui-surface border-l ui-border shadow-2xl flex flex-col',
            sizeClass
          ]"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <div class="flex items-center justify-between px-4 py-3 border-b ui-border shrink-0">
            <h3 class="text-sm font-semibold ui-text">
              {{ title }}
            </h3>
            <button
              v-if="showCloseButton"
              class="w-8 h-8 rounded-md ui-text-muted hover:bg-(--ui-surface-muted) hover:text-(--ui-text) transition-colors flex items-center justify-center"
              @click="close"
            >
              <span class="sr-only">Close drawer</span>
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto">
            <slot />
          </div>

          <div
            v-if="$slots.footer"
            class="border-t ui-border px-4 py-3 shrink-0"
          >
            <slot name="footer" />
          </div>
        </aside>
      </transition>
    </div>
  </transition>
</template>
