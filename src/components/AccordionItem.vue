<template>
  <div :class="itemClasses">
    <!-- Header -->
    <Button
      :class="headerClasses"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <slot
        name="header"
        :is-open="isOpen"
      />
      <ChevronDownIcon
        :class="cn('w-5 h-5 transition-transform ml-2', { 'rotate-180': isOpen })"
      />
    </Button>

    <!-- Content -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div
        v-if="isOpen"
        :class="contentClasses"
      >
        <slot
          name="content"
          :is-open="isOpen"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'
import Button from './Button.vue'

const ChevronDownIcon = {
  render() {
    return h('svg', {
      fill: 'none',
      viewBox: '0 0 24 24',
      'stroke-width': '1.5',
      stroke: 'currentColor'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'm19.5 8.25-7.5 7.5-7.5-7.5'
      })
    ])
  }
}

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'bordered', 'filled', 'flush'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

const isOpen = ref(false)
const toggle = () => (isOpen.value = !isOpen.value)

const itemVariants = cva('', {
  variants: {
    variant: {
      default: '',
      bordered: 'border ui-border-strong  rounded-lg overflow-hidden',
      filled: 'ui-surface-strong border ui-border-strong  rounded-lg overflow-hidden',
      flush: ''
    }
  }
})

const headerVariants = cva(
  'flex items-center justify-between w-full text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-(--ui-primary) focus:ring-offset-2',
  {
    variants: {
      size: {
        sm: 'p-3 text-sm',
        md: 'p-4 text-base',
        lg: 'p-6 text-lg'
      }
    }
  }
)

const contentVariants = cva('overflow-hidden ui-text border-t ui-border-strong ', {
  variants: {
    size: {
      sm: 'p-3 text-sm',
      md: 'p-4 text-base',
      lg: 'p-6 text-lg'
    }
  }
})

const itemClasses = computed(() =>
  cn(itemVariants({ variant: props.variant }))
)

const headerClasses = computed(() =>
  cn(headerVariants({ size: props.size }))
)

const contentClasses = computed(() =>
  cn(contentVariants({ size: props.size }))
)
</script>
