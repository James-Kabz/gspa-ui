<template>
  <component
    :is="adaptedIcon"
    v-if="adaptedIcon"
    :class="iconClasses"
    :aria-hidden="!ariaLabel"
    :aria-label="ariaLabel"
    :role="ariaLabel ? 'img' : undefined"
  />
  <font-awesome-icon
    v-else-if="resolvedIcon"
    :icon="[prefix, resolvedIcon]"
    :size="faSize"
    :class="iconClasses"
    :aria-hidden="!ariaLabel"
    :aria-label="ariaLabel"
    :role="ariaLabel ? 'img' : undefined"
  />
</template>

<script setup>
import { computed, inject } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ICON_ADAPTER_KEY } from '../lib/icon.js'

const props = defineProps({
  icon: {
    type: String,
    default: null
  },
  name: {
    type: String,
    default: null
  },
  prefix: {
    type: String,
    default: 'fa'
  },
  size: {
    type: String,
    default: 'md'
  },
  color: String,
  ariaLabel: String
})

const resolvedIcon = computed(() => props.icon || props.name)
const iconAdapter = inject(ICON_ADAPTER_KEY, null)
const adaptedIcon = computed(() => {
  if (typeof iconAdapter !== 'function' || !resolvedIcon.value) return null
  return iconAdapter({ name: resolvedIcon.value, prefix: props.prefix })
})

const faSize = computed(() => {
  const sizes = {
    xs: 'xs',
    sm: 'sm', 
    md: 'lg',      // FontAwesome sizes: xs, sm, lg, xl, 2x, 3x, etc.
    lg: 'xl',
    xl: '2x',
    xxl: '3x'
  }
  return sizes[props.size] || 'lg'
})

const colorClasses = computed(() => {
  if (!props.color) return 'text-current'
  return props.color.startsWith('text-') ? props.color : `text-${props.color}`
})

const iconClasses = computed(() => [
  colorClasses.value,
  'inline-block'
])
</script>
