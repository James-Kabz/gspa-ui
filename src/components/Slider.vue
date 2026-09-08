<template>
  <div class="w-full">
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      class="w-full cursor-pointer"
      :style="{ accentColor: sliderAccentColor }"
      @input="updateValue"
    >
    <div class="flex justify-between text-xs ui-text mt-1">
      <span>{{ min }}</span>
      <span>{{ modelValue }}</span>
      <span>{{ max }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [Number, String], default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 }
})

const emit = defineEmits(["update:modelValue"])

const sliderAccentColor = computed(() => {
  const value = Number(props.modelValue)
  const min = Number(props.min)
  const max = Number(props.max)

  if (Number.isNaN(value) || Number.isNaN(min) || Number.isNaN(max) || max <= min) {
    return 'var(--ui-primary)'
  }

  const clamped = Math.min(Math.max(value, min), max)
  const ratio = (clamped - min) / (max - min)

  if (ratio <= 0.2) return '#16a34a'
  if (ratio <= 0.4) return '#65a30d'
  if (ratio <= 0.6) return '#eab308'
  if (ratio <= 0.8) return '#f97316'
  return '#dc2626'
})

const updateValue = (event) => {
  emit("update:modelValue", Number(event.target.value))
}
</script>
