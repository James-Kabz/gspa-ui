<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Input from '../../components/Input.vue'
import Icon from '../../components/Icon.vue'
import DocsSidebar from './DocsSidebar.vue'
import packageJson from '../../../package.json'

const packageVersion = packageJson.version
const githubUrl = 'https://github.com/James-Kabz/gspa-ui'

const route = useRoute()
const router = useRouter()
const headerSearch = ref((route.query.q || '').toString())
const mobileSidebarOpen = ref(false)

watch(
  () => route.query.q,
  (value) => {
    headerSearch.value = (value || '').toString()
  }
)

watch(
  () => route.fullPath,
  () => {
    mobileSidebarOpen.value = false
  }
)

const goToComponentsWithSearch = () => {
  const query = headerSearch.value.trim()
  router.push({
    path: '/components/components',
    query: query ? { q: query } : {}
  })
}

const handleSearchKeydown = (event) => {
  if (event.key === 'Enter') {
    goToComponentsWithSearch()
  }
}

const toggleMobileSidebar = () => {
  mobileSidebarOpen.value = !mobileSidebarOpen.value
}
</script>

<template>
  <div class="w-full max-w-full docs-shell">
    <header class="sticky top-0 z-50 border-b ui-border-strong bg-[color:color-mix(in oklab, var(--ui-surface), transparent 8%)] backdrop-blur-md">
      <div class="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md border ui-border-strong hover:bg-(--ui-surface-soft) lg:hidden"
            @click="toggleMobileSidebar"
          >
            <Icon
              icon="bars"
              size="sm"
            />
          </button>
          <div class="flex h-9 w-9 items-center justify-center rounded-lg docs-brand-chip text-sm font-bold text-white">
            UI
          </div>
          <div>
            <p class="text-sm font-semibold">
              GSPA UI
            </p>
            <p class="text-xs ui-text-muted">
              Documentation
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="hidden w-72 lg:block">
            <Input
              v-model="headerSearch"
              placeholder="Search"
              clearable
              @keydown="handleSearchKeydown"
            />
          </div>
          <a
            :href="githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-md border ui-border-strong px-3 py-1.5 text-xs font-medium hover:bg-(--ui-surface-soft)"
          >
            GitHub
          </a>
          <span class="rounded-md border ui-border-strong px-3 py-1.5 text-xs font-semibold ui-text-muted">
            v{{ packageVersion }}
          </span>
        </div>
      </div>
    </header>

    <div
      v-if="mobileSidebarOpen"
      class="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px] lg:hidden"
      @click="mobileSidebarOpen = false"
    />

    <div class="mx-auto w-full max-w-8xl docs-frame">
      <aside class="docs-sidebar-col">
        <div class="docs-sidebar-scroll">
          <DocsSidebar />
        </div>
      </aside>

      <aside
        class="docs-mobile-sidebar"
        :class="{ 'docs-mobile-sidebar-open': mobileSidebarOpen }"
      >
        <div class="docs-mobile-sidebar-scroll">
          <DocsSidebar />
        </div>
      </aside>

      <main class="min-w-0 px-4 py-6 sm:px-6 lg:px-10">
        <section class="mx-auto w-full max-w-full docs-content">
          <RouterView />
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.docs-brand-chip {
  background: linear-gradient(135deg, #156df9 0%, #00a7ff 100%);
}

.docs-shell {
  background:
    radial-gradient(circle at 8% -4%, color-mix(in oklab, var(--ui-primary), transparent 88%) 0%, transparent 45%),
    radial-gradient(circle at 100% 0%, color-mix(in oklab, var(--ui-accent), transparent 92%) 0%, transparent 40%),
    var(--ui-bg);
}

.docs-frame {
  display: grid;
  grid-template-columns: 270px minmax(0, 1fr);
  min-height: calc(100vh - 4rem);
}

.docs-sidebar-col {
  border-right: 1px solid var(--ui-border-strong);
}

.docs-sidebar-scroll {
  position: sticky;
  top: 4rem;
  height: calc(100vh - 4rem);
  overflow-y: auto;
}

.docs-mobile-sidebar {
  position: fixed;
  top: 4rem;
  left: 0;
  z-index: 60;
  width: min(85vw, 320px);
  height: calc(100vh - 4rem);
  border-right: 1px solid var(--ui-border-strong);
  background: var(--ui-surface);
  transform: translateX(-100%);
  transition: transform 0.2s ease;
}

.docs-mobile-sidebar-open {
  transform: translateX(0);
}

.docs-mobile-sidebar-scroll {
  height: 100%;
  overflow-y: auto;
}

.docs-content :deep(pre) {
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.docs-content :deep(table) {
  display: block;
  width: 100%;
  overflow-x: auto;
}

.docs-content :deep(img),
.docs-content :deep(svg) {
  max-width: 100%;
  height: auto;
}

@media (max-width: 1023px) {
  .docs-frame {
    display: block;
  }

  .docs-sidebar-col {
    display: none;
  }
}

@media (max-width: 640px) {
  .docs-content :deep(article) {
    padding: 1rem;
  }

  .docs-content :deep(h1) {
    font-size: 1.75rem;
    line-height: 2rem;
  }

  .docs-content :deep(h2) {
    font-size: 1.35rem;
    line-height: 1.75rem;
  }

  .docs-content :deep(p) {
    line-height: 1.6;
  }

  .docs-content :deep(pre) {
    font-size: 0.75rem;
  }
}
</style>
