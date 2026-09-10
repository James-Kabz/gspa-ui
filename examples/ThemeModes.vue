<script setup>
import { ref } from 'vue'
import { Button, Card, setMode } from '@gspa/ui'
import '@gspa/ui/css'

const mode = ref('light')
const toggleMode = () => {
  mode.value = mode.value === 'light' ? 'dark' : 'light'
  setMode(mode.value)
}
</script>

<template>
  <main class="min-h-screen ui-bg p-8">
    <Card class="mx-auto max-w-lg">
      <p class="ui-eyebrow">GSPA Security Academy</p>
      <h1 class="ui-display-title mt-2 text-3xl">Professional learning, clearly structured</h1>
      <p class="mt-3 ui-text-muted">The same semantic tokens provide accessible light and dark themes.</p>
      <Button class="mt-6" variant="primaryOutline" @click="toggleMode">Use {{ mode === 'light' ? 'dark' : 'light' }} mode</Button>
    </Card>
  </main>
</template>
