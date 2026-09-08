<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

const props = defineProps({
  value: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'success', 'warning', 'danger'].includes(value)
  },
  showLabel: Boolean,
  class: String
})

const clampedValue = computed(() => {
  const safeMax = props.max > 0 ? props.max : 100
  const percentage = (props.value / safeMax) * 100
  return Math.min(Math.max(percentage, 0), 100)
})

const containerVariants = cva(
  'relative w-full overflow-hidden rounded-full ui-surface-muted border ui-border-strong',
  {
    variants: {
      size: {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4'
      }
    }
  }
)

const progressVariants = cva(
  'h-full w-full flex-1 transition-[width,background-color] duration-300 ease-in-out'
)

const containerClasses = computed(() =>
  cn(containerVariants({ size: props.size }), props.class)
)

const defaultContrastScale = [
  { max: 20, class: 'bg-red-700' },
  { max: 40, class: 'bg-orange-600' },
  { max: 60, class: 'bg-amber-500' },
  { max: 80, class: 'bg-lime-600' },
  { max: 100, class: 'bg-emerald-700' }
]

const variantContrastScale = {
  success: [
    { max: 33, class: 'bg-emerald-500' },
    { max: 66, class: 'bg-emerald-600' },
    { max: 100, class: 'bg-emerald-700' }
  ],
  warning: [
    { max: 33, class: 'bg-amber-500' },
    { max: 66, class: 'bg-amber-600' },
    { max: 100, class: 'bg-orange-700' }
  ],
  danger: [
    { max: 33, class: 'bg-rose-500' },
    { max: 66, class: 'bg-red-600' },
    { max: 100, class: 'bg-red-700' }
  ]
}

const getScaleClass = (scale, percentage) =>
  scale.find((step) => percentage <= step.max)?.class || scale[scale.length - 1].class

const progressToneClass = computed(() => {
  if (props.variant === 'default') {
    return getScaleClass(defaultContrastScale, clampedValue.value)
  }

  const scale = variantContrastScale[props.variant] || defaultContrastScale
  return getScaleClass(scale, clampedValue.value)
})

const progressClasses = computed(() =>
  cn(progressVariants(), progressToneClass.value)
)

const labelClasses = computed(() =>
  'absolute inset-0 flex items-center justify-center text-xs font-medium ui-text'
)

const progressStyle = computed(() => ({
  width: `${clampedValue.value}%`
}))
</script>

<template>
  <div :class="containerClasses">
    <div
      :class="progressClasses"
      :style="progressStyle"
      role="progressbar"
      :aria-valuenow="clampedValue"
      :aria-valuemin="0"
      :aria-valuemax="100"
    />
    <span
      v-if="showLabel"
      :class="labelClasses"
    >
      {{ clampedValue }}%
    </span>
  </div>
</template>
