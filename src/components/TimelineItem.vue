<template>
  <div
    :class="[
      'relative flex',
      orientation === 'vertical'
        ? 'items-start mb-8 last:mb-0'
        : 'flex-col items-center mx-8 last:mx-0'
    ]"
  >
    <!-- Line -->
    <div
      v-if="orientation === 'vertical'"
      class="absolute left-3 top-0 w-0.5 h-full ui-bg"
    />

    <!-- Dot / Icon -->
    <div
      class="z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 border-(--ui-primary) ui-surface  ui-primary"
    >
      <slot name="icon">
        <!-- Default dot -->
        <div class="w-2 h-2 rounded-full ui-primary-bg" />
      </slot>
    </div>

    <!-- Content -->
    <div
      :class="[
        'ml-6',
        orientation === 'horizontal' ? 'mt-2 text-center' : ''
      ]"
    >
      <h3 class="ui-text font-medium">
        <slot name="title">
          {{ title }}
        </slot>
      </h3>
      <p
        v-if="subtitle"
        class="ui-text text-sm"
      >
        <slot name="subtitle">
          {{ subtitle }}
        </slot>
      </p>
      <div class="mt-2 ui-text text-sm">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  orientation: {
    type: String,
    default: 'vertical',
    validator: (val) => ['vertical', 'horizontal'].includes(val)
  }
})
</script>
