<template>
  <div
    :class="[
      'relative flex ui-text',
      orientation === 'vertical' ? 'flex-col' : 'flex-row'
    ]"
  >
    <slot />
  </div>
</template>

<script setup>
defineProps({
  orientation: {
    type: String,
    default: 'vertical',
    validator: (val) => ['vertical', 'horizontal'].includes(val)
  }
})
</script>
