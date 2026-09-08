<template>
  <div class="flex items-center">
    <div
      :class="[
        'flex items-center justify-center w-8 h-8 rounded-full border-2',
        active ? 'ui-primary-bg border-(--ui-primary) ui-text' :
        completed ? 'ui-success-bg border-(--ui-success) ui-text' :
        'ui-border-strong  ui-text'
      ]"
    >
      <span>{{ step }}</span>
    </div>
    <div class="ml-2">
      <div class="font-medium">
        {{ title }}
      </div>
      <div
        v-if="description"
        class="text-sm ui-text"
      >
        {{ description }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  step: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  active: { type: Boolean, default: false },
  completed: { type: Boolean, default: false }
})
</script>
