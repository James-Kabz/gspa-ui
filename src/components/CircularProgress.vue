<template>
  <div :class="cn('relative inline-flex items-center justify-center', $attrs.class)">
    <svg
      :width="sizeValue"
      :height="sizeValue"
      :viewBox="`0 0 ${sizeValue} ${sizeValue}`"
      class="transform -rotate-90"
    >
      <!-- Background circle -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke="backgroundColor"
        :stroke-width="strokeWidth"
        fill="none"
      />
      <!-- Progress circle -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke="progressColor"
        :stroke-width="strokeWidth"
        fill="none"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        :stroke-linecap="strokeLinecap"
        class="transition-all duration-300 ease-in-out"
      />
    </svg>
    <!-- Optional text in center -->
    <div
      v-if="showValue"
      class="absolute inset-0 flex items-center justify-center"
    >
      <span :class="cn('text-xs font-medium', textColor)">
        {{ showRawValue ? numValue.toFixed(2) : Math.round(clampedValue) + '%' }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { cn } from '../utils/cn.js'

const props = defineProps({
  value: {
    type: [Number, String],
    default: 0
  },
  max: {
    type: [Number, String],
    default: 100
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => [ 'xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'success', 'warning', 'danger'].includes(value)
  },
  showValue: {
    type: Boolean,
    default: true
  },
  showRawValue: {
    type: Boolean,
    default: false
  },
  dynamicColor: {
    type: Boolean,
    default: true
  },
  dynamicColorStops: {
    type: Array,
    default: () => ([
      { max: 39, stroke: '#ef4444', textClass: 'text-red-700' },
      { max: 79, stroke: '#f97316', textClass: 'text-orange-700' },
      { max: 100, stroke: '#22c55e', textClass: 'text-green-700' }
    ])
  },
  dynamicFallbackStroke: {
    type: String,
    default: '#22c55e'
  },
  dynamicFallbackTextClass: {
    type: String,
    default: 'text-green-700'
  },
  strokeLinecap: {
    type: String,
    default: 'round',
    validator: (value) => ['butt', 'round', 'square'].includes(value)
  }
})

const numValue = computed(() => parseFloat(props.value) || 0)
const numMax = computed(() => parseFloat(props.max) || 100)

const clampedValue = computed(() => {
  const percentage = (numValue.value / numMax.value) * 100
  return Math.min(Math.max(percentage, 0), 100)
})

const sizeValue = computed(() => {
  const sizes = {
    xs: 42,
    sm: 48,
    md: 64,
    lg: 80,
    xl: 96
  }
  return sizes[props.size] || 64
})

const strokeWidth = computed(() => {
  const widths = {
    xs: 2.5,
    sm: 4,
    md: 5,
    lg: 6,
    xl: 7
  }
  return widths[props.size] || 5
})

const center = computed(() => sizeValue.value / 2)
const radius = computed(() => center.value - strokeWidth.value / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)

const strokeDashoffset = computed(() => {
  return circumference.value - (clampedValue.value / 100) * circumference.value
})

const resolvedDynamicStop = computed(() => {
  const percentage = clampedValue.value
  const stops = Array.isArray(props.dynamicColorStops) ? props.dynamicColorStops : []
  const sorted = [...stops].sort((a, b) => Number(a?.max ?? 0) - Number(b?.max ?? 0))
  return sorted.find(stop => percentage <= Number(stop?.max ?? 0)) || null
})

const progressColor = computed(() => {
  if (props.dynamicColor) {
    return resolvedDynamicStop.value?.stroke || props.dynamicFallbackStroke
  }

  const colors = {
    default: 'var(--ui-primary)',
    success: 'var(--ui-success)',
    warning: 'var(--ui-warning)',
    danger: 'var(--ui-danger)'
  }
  return colors[props.variant] || colors.default
})

const backgroundColor = computed(() => {
  return 'var(--ui-border-strong)'
})

const textColor = computed(() => {
  if (props.dynamicColor) {
    return resolvedDynamicStop.value?.textClass || props.dynamicFallbackTextClass
  }

  const colors = {
    default: 'ui-primary',
    success: 'ui-success',
    warning: 'ui-warning',
    danger: 'ui-danger'
  }
  return colors[props.variant] || colors.default
})
</script>
