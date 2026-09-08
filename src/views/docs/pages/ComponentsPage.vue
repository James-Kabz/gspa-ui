<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import Badge from '../../../components/Badge.vue'
import Button from '../../../components/Button.vue'
import Checkbox from '../../../components/Checkbox.vue'
import Input from '../../../components/Input.vue'
import Select from '../../../components/Select.vue'
import Tab from '../../../components/Tab.vue'
import TabPanel from '../../../components/TabPanel.vue'
import { getComponentGroups } from '../componentDocs.js'

const route = useRoute()
const router = useRouter()

const searchQuery = ref((route.query.q || '').toString())
const copiedKey = ref('')
const liveQuery = ref('Policy reminder')
const demoPlan = ref('starter')
const demoNotifications = ref(false)
const demoButtonLoading = ref(false)
const demoActiveTab = ref(0)
const demoTabLoading = ref(false)

const demoPlanOptions = [
  { value: 'starter', label: 'Starter' },
  { value: 'growth', label: 'Growth' },
  { value: 'enterprise', label: 'Enterprise' }
]

const componentsPlayground = `<template>\n  <div class="space-y-3">\n    <Input v-model="keyword" placeholder="Search keyword" />\n    <Select v-model="plan" :options="planOptions" placeholder="Choose plan" />\n    <Checkbox v-model="notify" label="Enable notifications" />\n    <Button :loading="saving" @click="save">Save Preferences</Button>\n  </div>\n</template>`

watch(
  () => route.query.q,
  (value) => {
    const incoming = (value || '').toString()
    if (incoming !== searchQuery.value) {
      searchQuery.value = incoming
    }
  }
)

watch(searchQuery, (value) => {
  const q = value.trim() || undefined
  if ((route.query.q || undefined) === q) return

  router.replace({
    query: {
      ...route.query,
      q
    }
  })
})

const normalizedSearch = computed(() => searchQuery.value.trim().toLowerCase())

const filteredGroups = computed(() => {
  return getComponentGroups(normalizedSearch.value)
})

const filteredComponentsCount = computed(() => {
  return filteredGroups.value.reduce((sum, group) => sum + group.items.length, 0)
})

const runDemoAction = () => {
  demoButtonLoading.value = true
  window.setTimeout(() => {
    demoButtonLoading.value = false
  }, 900)
}

const handleDemoTabChange = () => {
  demoTabLoading.value = true
  window.setTimeout(() => {
    demoTabLoading.value = false
  }, 280)
}

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
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold">
            Components
          </h1>
          <p class="mt-3 text-lg leading-8 ui-text-muted">
            Try live controls, then open each component page for full props and usage details.
          </p>
        </div>

        <RouterLink
          to="/components/full-gallery"
          class="inline-flex rounded-md border ui-border-strong px-3 py-1.5 text-sm font-medium hover:bg-(--ui-surface-soft)"
        >
          Open Full Gallery
        </RouterLink>
      </div>

      <div class="mt-4 grid gap-4 lg:grid-cols-3">
        <div class="rounded-xl border ui-border-strong ui-surface-soft p-4">
          <p class="text-xs font-semibold uppercase tracking-wide ui-text-muted">
            Interactive Playground
          </p>
          <div class="mt-3 space-y-3">
            <Input
              v-model="liveQuery"
              placeholder="Search reminders"
              clearable
            />
            <Select
              v-model="demoPlan"
              :options="demoPlanOptions"
              placeholder="Choose plan"
            />
            <Checkbox
              v-model="demoNotifications"
              label="Enable notifications"
              description="Toggle to test component state"
            />
            <div class="flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                :loading="demoButtonLoading"
                loading-text="Saving..."
                @click="runDemoAction"
              >
                Save Preferences
              </Button>
              <Badge variant="secondary">
                {{ liveQuery }}
              </Badge>
              <Badge variant="info">
                {{ demoPlan }}
              </Badge>
              <Badge :variant="demoNotifications ? 'success' : 'warning'">
                {{ demoNotifications ? 'On' : 'Off' }}
              </Badge>
            </div>
          </div>
        </div>

        <div class="rounded-xl border ui-border-strong bg-black/92 p-4">
          <div class="mb-2 flex items-center justify-between gap-3">
            <p class="text-xs font-semibold uppercase tracking-wide text-white/80">
              Playground Snippet
            </p>
            <button
              type="button"
              class="rounded-md border border-white/30 px-3 py-1 text-xs font-medium text-white hover:bg-white/10"
              @click="copySnippet('componentsPlayground', componentsPlayground)"
            >
              {{ copiedKey === 'componentsPlayground' ? 'Copied' : 'Copy' }}
            </button>
          </div>
          <pre class="overflow-x-auto text-sm text-white"><code>{{ componentsPlayground }}</code></pre>
        </div>

        <div class="rounded-xl border ui-border-strong ui-surface-soft p-4">
          <p class="text-xs font-semibold uppercase tracking-wide ui-text-muted">
            Tabs Preview
          </p>
          <div class="mt-3">
            <Tab
              v-model="demoActiveTab"
              size="sm"
              :loading="demoTabLoading"
              @tab-change="handleDemoTabChange"
            >
              <TabPanel
                label="Overview"
                :loading="demoTabLoading"
              >
                <p class="text-sm ui-text-muted">
                  Quick summary panel with modern active pill and keyboard navigation.
                </p>
              </TabPanel>
              <TabPanel
                label="Schedule"
                :loading="demoTabLoading"
              >
                <p class="text-sm ui-text-muted">
                  Use Left/Right arrow keys, Home, and End to switch tabs quickly.
                </p>
              </TabPanel>
              <TabPanel
                label="Settings"
                :loading="demoTabLoading"
              >
                <p class="text-sm ui-text-muted">
                  `v-model` can persist active tab via route query to survive refresh.
                </p>
              </TabPanel>
            </Tab>
          </div>
        </div>
      </div>
    </article>

    <article class="rounded-2xl border ui-border-strong ui-surface p-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold">
            Component Reference
          </h2>
          <p class="mt-1 text-sm ui-text-muted">
            Showing {{ filteredComponentsCount }} components.
          </p>
        </div>
        <div class="w-full max-w-xs">
          <Input
            v-model="searchQuery"
            placeholder="Search components"
            clearable
          />
        </div>
      </div>

      <div class="mt-5 space-y-5">
        <article
          v-for="group in filteredGroups"
          :key="group.title"
          class="rounded-xl border ui-border-strong ui-surface-soft p-4"
        >
          <h3 class="text-lg font-semibold">
            {{ group.title }}
          </h3>
          <p class="mt-1 text-sm ui-text-muted">
            {{ group.description }}
          </p>

          <div class="mt-4 grid gap-2">
            <div
              v-for="component in group.items"
              :key="component.slug"
              class="flex flex-wrap items-center justify-between gap-3 rounded-lg border ui-border-strong ui-surface px-3 py-2.5"
            >
              <div>
                <p class="font-medium">
                  {{ component.name }}
                </p>
                <p class="text-xs ui-text-muted">
                  {{ component.sourcePath || 'Source file unavailable' }}
                </p>
              </div>

              <RouterLink
                :to="`/components/components/${component.slug}`"
                class="rounded-md border ui-border-strong px-3 py-1.5 text-sm font-medium hover:bg-(--ui-surface-soft)"
              >
                View docs
              </RouterLink>
            </div>
          </div>
        </article>
      </div>
    </article>
  </div>
</template>
