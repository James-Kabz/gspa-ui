<script setup>
import { ref } from 'vue'

const copied = ref(false)

const academyPalette = [
  { name: 'Institutional navy', value: '#173866', class: 'bg-[#173866]' },
  { name: 'Credential gold', value: '#B98218', class: 'bg-[#b98218]' },
  { name: 'Cyber', value: '#176B87', class: 'bg-[#176b87]' },
  { name: 'Success', value: '#14745D', class: 'bg-[#14745d]' },
  { name: 'Canvas', value: '#F5F7FB', class: 'bg-[#f5f7fb]' }
]

const treeShaking = `import { createApp } from 'vue'
import App from './App.vue'
import { Button, Input, Card } from '@gspa/ui'
import '@gspa/ui/css'

const app = createApp(App)

app.component('Button', Button)
app.component('Input', Input)
app.component('Card', Card)
app.mount('#app')`

const copySnippet = async () => {
  if (!navigator?.clipboard) return
  await navigator.clipboard.writeText(treeShaking)
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1200)
}
</script>

<template>
  <div class="space-y-8">
    <article class="rounded-2xl border ui-border-strong ui-surface p-6">
      <p class="ui-eyebrow">
        Design system
      </p>
      <h1 class="ui-display-title mt-2 text-3xl">
        Theming
      </h1>
      <p class="mt-3 max-w-4xl text-lg leading-8 ui-text-muted">
        Security Academy is the default preset: institutional navy, credential gold, cool neutral surfaces, and restrained visual hierarchy for serious professional learning.
      </p>

      <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div
          v-for="color in academyPalette"
          :key="color.name"
          class="overflow-hidden rounded-lg border ui-border"
        >
          <div :class="['h-16', color.class]" />
          <div class="ui-surface px-3 py-2">
            <div class="text-xs font-semibold ui-text">
              {{ color.name }}
            </div>
            <div class="mt-0.5 font-mono text-[11px] ui-text-muted">
              {{ color.value }}
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 rounded-xl border ui-border-strong bg-black/92 p-4">
        <div class="mb-2 flex items-center justify-between gap-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-white/80">
            Tree-shaking Pattern
          </p>
          <button
            type="button"
            class="rounded-md border border-white/30 px-3 py-1 text-xs font-medium text-white hover:bg-white/10"
            @click="copySnippet"
          >
            {{ copied ? 'Copied' : 'Copy' }}
          </button>
        </div>
        <pre class="overflow-x-auto text-xs text-white"><code>{{ treeShaking }}</code></pre>
      </div>
    </article>

    <article class="rounded-2xl border ui-border-strong ui-surface p-6">
      <h2 class="text-2xl font-bold">
        Pass Through
      </h2>
      <p class="mt-2 max-w-4xl text-lg leading-8 ui-text-muted">
        Tailor internals by passing classes and attributes while preserving behavior and accessibility.
      </p>
    </article>

    <article class="rounded-2xl border ui-border-strong ui-surface p-6">
      <h2 class="text-2xl font-bold">
        Accessibility
      </h2>
      <p class="mt-2 max-w-4xl text-lg leading-8 ui-text-muted">
        Components include keyboard interaction patterns and semantic output to help meet accessibility requirements.
      </p>
    </article>

    <article class="rounded-2xl border ui-border-strong ui-surface p-6">
      <h2 class="text-2xl font-bold">
        Add-Ons
      </h2>
      <p class="mt-2 max-w-4xl text-lg leading-8 ui-text-muted">
        Use helpers like `tooltip` and `toast` with charts and data components to build complete dashboard flows.
      </p>
    </article>
  </div>
</template>
