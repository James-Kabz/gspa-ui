<template>
  <div :class="containerClasses">
    <img
      :src="src"
      :alt="alt"
      :class="imageClasses"
      :loading="loading"
      @load="handleLoad"
      @error="handleError"
    >
    <div
      v-if="isLoading"
      :class="placeholderClasses"
    >
      <Spinner
        v-if="showSpinner"
        size="sm"
      />
    </div>
    <div
      v-if="hasError"
      :class="errorClasses"
    >
      <Icon
        name="ImageOff"
        class="h-8 w-8 ui-text"
      />
      <span class="text-sm ui-text">Failed to load image</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'
import Icon from './Icon.vue'
import Spinner from './Spinner.vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  aspectRatio: {
    type: String,
    default: 'auto',
    validator: (value) => ['auto', 'square', '16/9', '4/3', '3/2'].includes(value)
  },
  objectFit: {
    type: String,
    default: 'cover',
    validator: (value) => ['cover', 'contain', 'fill', 'none', 'scale-down'].includes(value)
  },
  loading: {
    type: String,
    default: 'lazy',
    validator: (value) => ['lazy', 'eager'].includes(value)
  },
  showSpinner: {
    type: Boolean,
    default: true
  },
  class: String
})

const emit = defineEmits(['load', 'error'])

const isLoading = ref(true)
const hasError = ref(false)

const containerVariants = cva(
  'relative overflow-hidden ui-surface-muted',
  {
    variants: {
      aspectRatio: {
        auto: '',
        square: 'aspect-square',
        '16/9': 'aspect-video',
        '4/3': 'aspect-[4/3]',
        '3/2': 'aspect-[3/2]'
      }
    }
  }
)

const containerClasses = computed(() => 
  cn(containerVariants({ aspectRatio: props.aspectRatio }), props.class)
)

const imageClasses = computed(() => 
  cn(
    'h-full w-full transition-opacity duration-300',
    {
      'object-cover': props.objectFit === 'cover',
      'object-contain': props.objectFit === 'contain',
      'object-fill': props.objectFit === 'fill',
      'object-none': props.objectFit === 'none',
      'object-scale-down': props.objectFit === 'scale-down'
    },
    isLoading.value && 'opacity-0',
    hasError.value && 'hidden'
  )
)

const placeholderClasses = computed(() => 
  'absolute inset-0 flex items-center justify-center ui-surface-muted'
)

const errorClasses = computed(() => 
  'absolute inset-0 flex flex-col items-center justify-center gap-2 ui-surface-muted'
)

const handleLoad = (event) => {
  isLoading.value = false
  hasError.value = false
  emit('load', event)
}

const handleError = (event) => {
  isLoading.value = false
  hasError.value = true
  emit('error', event)
}
</script>
