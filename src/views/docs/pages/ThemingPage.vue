<script setup>
import { ref } from 'vue'

const copied = ref(false)

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
      <h1 class="text-3xl font-bold">
        Theming
      </h1>
      <p class="mt-3 max-w-4xl text-lg leading-8 ui-text-muted">
        GSPA UI theme behavior is controlled by exported helpers: `initTheme`, `setTheme`, `setMode`, `getTheme`, and `getMode`.
      </p>

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
