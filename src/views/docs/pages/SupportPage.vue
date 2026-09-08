<script setup>
import { ref } from 'vue'

const copied = ref(false)
const githubUrl = 'https://github.com/James-Kabz/gspa-ui'
const deploySnippet = `npm run build:docs
# output: dist-docs/`

const copySnippet = async () => {
  if (!navigator?.clipboard) return
  await navigator.clipboard.writeText(deploySnippet)
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
        Support
      </h1>
      <p class="mt-3 text-lg leading-8 ui-text-muted">
        Use GitHub for issues, contribution discussions, and release updates.
      </p>
      <div class="mt-4 flex flex-wrap gap-3">
        <a
          :href="githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-md border ui-border-strong px-3 py-1.5 text-sm font-medium hover:bg-(--ui-surface-soft)"
        >
          Open GitHub Repository
        </a>
        <a
          :href="`${githubUrl}/issues`"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-md border ui-border-strong px-3 py-1.5 text-sm font-medium hover:bg-(--ui-surface-soft)"
        >
          Report an Issue
        </a>
      </div>
    </article>

    <article class="rounded-2xl border ui-border-strong ui-surface p-6">
      <h2 class="text-2xl font-bold">
        Deploy Docs
      </h2>
      <div class="mt-4 rounded-xl border ui-border-strong bg-black/92 p-4">
        <div class="mb-2 flex items-center justify-between gap-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-white/80">
            Build Command
          </p>
          <button
            type="button"
            class="rounded-md border border-white/30 px-3 py-1 text-xs font-medium text-white hover:bg-white/10"
            @click="copySnippet"
          >
            {{ copied ? 'Copied' : 'Copy' }}
          </button>
        </div>
        <pre class="overflow-x-auto text-sm text-white"><code>{{ deploySnippet }}</code></pre>
      </div>
    </article>
  </div>
</template>
