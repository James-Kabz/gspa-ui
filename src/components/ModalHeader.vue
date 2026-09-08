<template>
  <div class="flex flex-col space-y-1.5 text-center sm:text-left">
    <h2
      v-if="title"
      class="text-lg font-semibold leading-none tracking-tight"
    >
      {{ title }}
    </h2>
    <p
      v-if="description"
      class="text-sm ui-text"
    >
      {{ description }}
    </p>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: String,
  description: String
})
</script>
