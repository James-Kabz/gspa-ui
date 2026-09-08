<template>
  <font-awesome-icon
    v-if="resolvedIcon"
    :icon="[prefix, resolvedIcon]"
    :size="faSize"
    :class="iconClasses"
    :aria-hidden="!ariaLabel"
    :aria-label="ariaLabel"
    :role="ariaLabel ? 'img' : undefined"
  />
</template>

<script setup>
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

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
