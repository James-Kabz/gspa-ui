<script setup>
import { onErrorCaptured, ref } from 'vue'

defineProps({
  component: {
    type: [Object, Function],
    default: null
  },
  componentName: {
    type: String,
    required: true
  },
  bindings: {
    type: Object,
    default: () => ({})
  },
  slotText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const renderError = ref('')

onErrorCaptured((error) => {
  renderError.value = error instanceof Error ? error.message : String(error)
  return false
})
</script>

<template>
  <div
    class="relative isolate overflow-hidden rounded-lg border ui-border-strong ui-surface p-3"
    style="transform: translateZ(0);"
  >
    <p class="mb-2 text-xs font-semibold uppercase tracking-wide ui-text-muted">
      {{ componentName }}
    </p>

    <p
      v-if="renderError"
      class="text-xs ui-danger"
    >
      Preview unavailable: {{ renderError }}
    </p>

    <component
      :is="component"
      v-else-if="component"
      v-bind="bindings"
      @update:model-value="emit('update:modelValue', $event)"
    >
      {{ slotText }}
    </component>

    <p
      v-else
      class="text-xs ui-text-muted"
    >
      Component could not be loaded.
    </p>
  </div>
</template>
