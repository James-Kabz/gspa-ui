<template>
  <option
    :value="value"
    :disabled="disabled"
    :selected="selected"
    :class="optionClasses"
  >
    <slot>{{ label }}</slot>
  </option>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: [String, Number, Boolean],
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const optionClasses = computed(() =>
  [
    'ui-surface-strong',
    'ui-text',
    props.disabled ? 'ui-text-soft' : 'ui-text'
  ]
)
</script>
