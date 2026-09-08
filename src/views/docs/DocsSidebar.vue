<script setup>
const sections = [
  {
    title: 'Getting Started',
    links: [{ to: '/components/getting-started', label: 'Overview' }]
  },
  {
    title: 'Installation',
    links: [{ to: '/components/installation', label: 'Packages and Setup' }]
  },
  {
    title: 'Theming',
    links: [{ to: '/components/theming', label: 'Theme Guide' }]
  },
  {
    title: 'Components',
    links: [{ to: '/components/components', label: 'Interactive Playground' }]
  },
  {
    title: 'Support',
    links: [{ to: '/components/support', label: 'GitHub' }]
  }
]
</script>

<template>
  <aside class="ui-surface h-full px-4 py-6">
    <p class="px-2 text-xs font-semibold uppercase tracking-[0.16em] ui-text-muted">
      Documentation
    </p>

    <nav class="mt-4 space-y-5">
      <section
        v-for="section in sections"
        :key="section.title"
      >
        <p class="px-2 text-sm font-semibold">
          {{ section.title }}
        </p>
        <div class="mt-1 space-y-1">
          <router-link
            v-for="item in section.links"
            :key="item.to"
            v-slot="{ href, navigate, isActive }"
            :to="item.to"
            custom
          >
            <a
              :href="href"
              :class="[
                'block rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'ui-primary-soft ui-primary border-(--ui-primary)'
                  : 'border-transparent ui-text-muted hover:bg-(--ui-surface-soft) hover:text-(--ui-text)'
              ]"
              @click="navigate"
            >
              {{ item.label }}
            </a>
          </router-link>
        </div>
      </section>
    </nav>
  </aside>
</template>
