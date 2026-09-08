<script setup>
import { computed, ref, watch } from 'vue'

const logoCache = new Map()
const inFlightLogos = new Map()

const props = defineProps({
  items: { type: Array, default: () => [] },
  activeKey: { type: [String, Number], default: null },
  title: { type: String, default: 'Navigation' },
  setupLabel: { type: String, default: 'Setup' },
  showSetup: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  heightOffset: { type: [String, Number], default: '4rem' },
  desktopOnly: { type: Boolean, default: true },
  resolveLogo: { type: Function, default: null }
})

const emit = defineEmits(['select', 'setup-click'])
const resolvedLogos = ref({})

const railHeight = computed(() => {
  const offset = typeof props.heightOffset === 'number' ? `${props.heightOffset}px` : props.heightOffset
  return { height: `calc(100vh - ${offset || '0px'})` }
})

const normalizeItemKey = (item, index) => {
  return item?.code ?? item?.id ?? item?.company_id ?? item?.key ?? index
}

const normalizeItemLabel = (item) => {
  return item?.code ?? item?.body ?? item?.name ?? item?.label ?? item?.company_name ?? 'Item'
}

const normalizeLogoId = (item) => {
  return (
    item?.logo_id ??
    item?.logoId ??
    item?.company_logo_id ??
    item?.companyLogoId ??
    item?.logo?.id ??
    item?.logo?.data?.id ??
    null
  )
}

const getInitials = (item) => {
  const label = String(normalizeItemLabel(item) || '').trim()
  if (!label) return 'C'
  const parts = label.split(/\s+/).filter(Boolean).slice(0, 2)
  return parts.map(part => part.charAt(0).toUpperCase()).join('') || 'C'
}

const isActive = (item, index) => String(normalizeItemKey(item, index)) === String(props.activeKey ?? '')

const getItemColor = (item) => String(item?.color_code || item?.colorCode || '#94A3B8')

const preloadLogo = async (item, index) => {
  if (typeof props.resolveLogo !== 'function') return
  const logoId = normalizeLogoId(item)
  if (!logoId) return

  const cacheKey = String(logoId)
  if (logoCache.has(cacheKey)) {
    resolvedLogos.value[cacheKey] = logoCache.get(cacheKey)
    return
  }

  if (!inFlightLogos.has(cacheKey)) {
    inFlightLogos.set(
      cacheKey,
      Promise.resolve(props.resolveLogo(logoId))
        .then((url) => {
          const normalized = url || null
          logoCache.set(cacheKey, normalized)
          return normalized
        })
        .catch(() => {
          logoCache.set(cacheKey, null)
          return null
        })
        .finally(() => {
          inFlightLogos.delete(cacheKey)
        })
    )
  }

  const result = await inFlightLogos.get(cacheKey)
  resolvedLogos.value[cacheKey] = result
  const itemKey = String(normalizeItemKey(item, index))
  if (result) resolvedLogos.value[itemKey] = result
}

watch(
  () => props.items,
  async (items) => {
    if (!Array.isArray(items) || typeof props.resolveLogo !== 'function') return
    await Promise.all(items.map((item, index) => preloadLogo(item, index)))
  },
  { immediate: true, deep: true }
)

const getLogoSrc = (item, index) => {
  const direct = item?.logo_url ?? item?.logoUrl
  if (typeof direct === 'string' && direct.trim()) return direct

  const logoId = normalizeLogoId(item)
  if (logoId) {
    const byId = resolvedLogos.value[String(logoId)] ?? logoCache.get(String(logoId))
    if (byId) return byId
  }

  return resolvedLogos.value[String(normalizeItemKey(item, index))] || null
}
</script>

<template>
  <aside :class="[
    'sticky top-16 w-72 rounded-xl border ui-border-strong ui-surface shadow-sm overflow-hidden',
    desktopOnly ? 'hidden lg:flex' : 'flex'
  ]" :style="railHeight">
    <div class="w-full flex flex-col">
      <div class="px-4 py-3 border-b ui-border-strong">
        <h3 class="text-sm font-semibold uppercase tracking-wide ui-text">{{ title }}</h3>
        <button v-if="showSetup" type="button"
          class="mt-3 w-full px-3 py-2 rounded-md border ui-border-strong ui-primary hover:bg-(--ui-primary-soft) text-sm font-medium"
          @click="emit('setup-click')">
          {{ setupLabel }}
        </button>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div v-if="loading" class="px-3 py-2 space-y-2">
          <div v-for="n in 6" :key="n" class="h-10 rounded-md ui-surface-muted animate-pulse"></div>
        </div>
        <div v-else-if="!items.length" class="px-4 py-3 text-sm ui-text">No compliance bodies</div>
        <nav v-else class="py-1" aria-label="Rail navigation">
          <button v-for="(item, index) in items" :key="String(normalizeItemKey(item, index))" type="button" :title="item?.body || item?.name || normalizeItemLabel(item)"
            class="w-full px-3 py-2 flex items-center gap-3 text-left transition-colors border-l-2 border-transparent hover:bg-(--ui-surface-muted) ui-text"
            :class="isActive(item, index) ? 'ui-primary-soft border-(--ui-primary) font-semibold' : ''"
            :aria-current="isActive(item, index) ? 'page' : undefined" @click="emit('select', item)">
            <span
              class="h-8 w-8 rounded-full overflow-hidden border ui-border-strong ui-surface-muted flex items-center justify-center text-xs font-semibold ui-text">
              <img v-if="getLogoSrc(item, index)" :src="getLogoSrc(item, index)" :alt="normalizeItemLabel(item)"
                class="h-full w-full object-cover">
              <span v-else>{{ getInitials(item) }}</span>
            </span>
            <span class="inline-block h-2.5 w-2.5 rounded-full shrink-0" :style="{ backgroundColor: getItemColor(item) }"></span>
            <span class="truncate text-sm">{{ normalizeItemLabel(item) }}</span>
          </button>
        </nav>
      </div>
    </div>
  </aside>
</template>
