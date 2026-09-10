<script setup>
import { computed, ref } from 'vue'

const packageName = '@gspa/ui'
const packageDisplayName = 'GSPA UI'

const selectedManager = ref('npm')
const copiedKey = ref('')

const installCommands = {
  npm: `npm install ${packageName}`,
  pnpm: `pnpm add ${packageName}`,
  yarn: `yarn add ${packageName}`,
  bun: `bun add ${packageName}`
}

const snippets = {
  fontAwesomeDependencies: `{
  "@fortawesome/fontawesome-svg-core": "^7.0.1",
  "@fortawesome/free-brands-svg-icons": "^7.0.1",
  "@fortawesome/free-regular-svg-icons": "^7.0.1",
  "@fortawesome/free-solid-svg-icons": "^7.0.1",
  "@fortawesome/vue-fontawesome": "^3.1.2"
}`,
  fontAwesomeInstall: 'npm install @fortawesome/fontawesome-svg-core@^7.0.1 @fortawesome/free-brands-svg-icons@^7.0.1 @fortawesome/free-regular-svg-icons@^7.0.1 @fortawesome/free-solid-svg-icons@^7.0.1 @fortawesome/vue-fontawesome@^3.1.2',
  fullMainSetup: `import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import VueUI, { tooltip, initTheme } from '${packageName}'
import '${packageName}/css'
import './styles/style.css'
import VueApexCharts from 'vue3-apexcharts'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(VueApexCharts)
app.use(VueUI, {
  authResolver: ({ permission, role, requireAll }) => {
    // Wire to your auth store/composable
    return myCanAccess(permission, role, requireAll)
  }
})
app.directive('tooltip', tooltip)

initTheme()

app.mount('#app')`
}

const installCommand = computed(() => installCommands[selectedManager.value])

const copySnippet = async (key, content) => {
  if (!navigator?.clipboard) return
  await navigator.clipboard.writeText(content)
  copiedKey.value = key
  window.setTimeout(() => {
    if (copiedKey.value === key) copiedKey.value = ''
  }, 1200)
}
</script>

<template>
  <div class="space-y-8">
    <article class="rounded-2xl border ui-border-strong ui-surface p-6">
      <h1 class="text-3xl font-bold">
        Installation
      </h1>
      <p class="mt-3 text-lg leading-8 ui-text-muted">
        Install {{ packageDisplayName }}, then register the plugin and tooltip directive. Form controls bring their own icons.
      </p>

      <div class="mt-4 flex flex-wrap gap-2">
        <button
          v-for="manager in ['npm', 'pnpm', 'yarn', 'bun']"
          :key="manager"
          type="button"
          :class="[
            'rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide',
            selectedManager === manager
              ? 'ui-primary-bg border-(--ui-primary)'
              : 'ui-border-strong hover:bg-(--ui-surface-soft)'
          ]"
          @click="selectedManager = manager"
        >
          {{ manager }}
        </button>
      </div>

      <div class="mt-4 rounded-xl border ui-border-strong bg-black/92 p-4">
        <div class="mb-2 flex items-center justify-between gap-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-white/80">
            Install Command
          </p>
          <button
            type="button"
            class="rounded-md border border-white/30 px-3 py-1 text-xs font-medium text-white hover:bg-white/10"
            @click="copySnippet('install', installCommand)"
          >
            {{ copiedKey === 'install' ? 'Copied' : 'Copy' }}
          </button>
        </div>
        <pre class="overflow-x-auto text-sm text-white"><code>{{ installCommand }}</code></pre>
      </div>
    </article>

    <article class="rounded-2xl border ui-border-strong ui-surface p-6">
      <h2 class="text-2xl font-bold">
        Optional Font Awesome Integration
      </h2>
      <p class="mt-2 ui-text-muted">
        Only install Font Awesome when using custom names through the Icon component. FormField and Input do not need global icon registration.
      </p>

      <div class="mt-4 rounded-xl border ui-border-strong bg-black/92 p-4">
        <div class="mb-2 flex items-center justify-between gap-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-white/80">
            Install
          </p>
          <button
            type="button"
            class="rounded-md border border-white/30 px-3 py-1 text-xs font-medium text-white hover:bg-white/10"
            @click="copySnippet('fontAwesomeInstall', snippets.fontAwesomeInstall)"
          >
            {{ copiedKey === 'fontAwesomeInstall' ? 'Copied' : 'Copy' }}
          </button>
        </div>
        <pre class="overflow-x-auto text-xs text-white"><code>{{ snippets.fontAwesomeInstall }}</code></pre>
      </div>

      <div class="mt-4 rounded-xl border ui-border-strong bg-black/92 p-4">
        <div class="mb-2 flex items-center justify-between gap-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-white/80">
            Versions
          </p>
          <button
            type="button"
            class="rounded-md border border-white/30 px-3 py-1 text-xs font-medium text-white hover:bg-white/10"
            @click="copySnippet('fontAwesomeDependencies', snippets.fontAwesomeDependencies)"
          >
            {{ copiedKey === 'fontAwesomeDependencies' ? 'Copied' : 'Copy' }}
          </button>
        </div>
        <pre class="overflow-x-auto text-xs text-white"><code>{{ snippets.fontAwesomeDependencies }}</code></pre>
      </div>
    </article>

    <article class="rounded-2xl border ui-border-strong ui-surface p-6">
      <h2 class="text-2xl font-bold">
        main.js Setup
      </h2>
      <div class="mt-4 rounded-xl border ui-border-strong bg-black/92 p-4">
        <div class="mb-2 flex items-center justify-between gap-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-white/80">
            Full setup
          </p>
          <button
            type="button"
            class="rounded-md border border-white/30 px-3 py-1 text-xs font-medium text-white hover:bg-white/10"
            @click="copySnippet('fullMainSetup', snippets.fullMainSetup)"
          >
            {{ copiedKey === 'fullMainSetup' ? 'Copied' : 'Copy' }}
          </button>
        </div>
        <pre class="overflow-x-auto text-xs text-white"><code>{{ snippets.fullMainSetup }}</code></pre>
      </div>
    </article>
  </div>
</template>
