<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { cn } from '../utils/cn.js'
import Icon from './Icon.vue'

// Props
const props = defineProps({
  sidebarWidth: {
    type: Number,
    default: 130
  },
  header: {
    type: Object,
    default: null
  },
  navigationItems: {
    type: Array,
    required: true,
  },
  mobileOpen: {
    type: Boolean,
    default: false
  },
  currentPath: {
    type: String,
    default: ''
  },
  // Search props
  showSearch: {
    type: Boolean,
    default: false
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...'
  },
  searchableMenus: {
    type: Array,
    default: () => [] // Array of menu names that should have search (e.g., ['compliance', 'risks'])
  },
  themeScope: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'module'].includes(value)
  }
})

// Emits
const emit = defineEmits([
  'navigate',
  'update:mobileOpen',
  'search'
])

// Internal State
const isMobile = ref(false)
const submenuOpen = ref(false)
const currentSubmenu = ref(null)
const searchQuery = ref('')
const submenuWidth = 320

// Computed
const isMobileOpen = computed(() => props.mobileOpen)

// Check if current submenu should show search
const shouldShowSubmenuSearch = computed(() => {
  if (!props.showSearch || !currentSubmenu.value) return false

  // Check if this menu is in the searchableMenus list
  const menuName = currentSubmenu.value.name?.toLowerCase() || ''
  return props.searchableMenus.some(name =>
    menuName.includes(name.toLowerCase())
  )
})

// Filter submenu items based on search query
const filteredSubmenuItems = computed(() => {
  if (!currentSubmenu.value?.subItems) return []

  if (!searchQuery.value.trim()) {
    return currentSubmenu.value.subItems
  }

  const query = searchQuery.value.toLowerCase().trim()
  return currentSubmenu.value.subItems.filter(item => {
    const label = item.label?.toLowerCase() || ''
    const name = item.name?.toLowerCase() || ''
    return label.includes(query) || name.includes(query)
  })
})

// Computed for main content margin
const contentMarginLeft = computed(() => {
  if (isMobile.value) {
    return 0
  }

  return props.sidebarWidth + (submenuOpen.value ? submenuWidth : 0)
})

const submenuDrawerStyle = computed(() => ({
  left: `${props.sidebarWidth}px`,
  width: `${submenuWidth}px`,
  maxWidth: `calc(100vw - ${props.sidebarWidth}px)`,
  top: '0px',
  height: '100vh',
  ...(props.themeScope === 'module'
    ? {
      background: 'color-mix(in oklab, var(--module-soft-alt, var(--ui-accent-soft)) 50%, var(--ui-surface) 50%)',
    }
    : {}),
}))

const sidebarStyle = computed(() => ({
  width: `${props.sidebarWidth}px`,
  top: isMobile.value ? '0px' : '4rem',
  ...(props.themeScope === 'module'
    ? {
      background: 'color-mix(in oklab, var(--module-soft, var(--ui-primary-soft)) 45%, var(--ui-background) 55%)',
    }
    : {}),
}))

// Methods
const handleNavigation = (item) => {
  emit('navigate', item)
  if (isMobile.value) {
    closeMobileSidebar()
  }
  // On mobile, always close menus after navigation.
  // On desktop, keep submenu open when navigating within it.
  const isSubmenuItem = submenuOpen.value && currentSubmenu.value && currentSubmenu.value.subItems.some(sub => sub.route === item.route)
  if (isMobile.value || !isSubmenuItem) {
    closeAllMenus()
  }
}

const closeMobileSidebar = () => {
  emit('update:mobileOpen', false)
}

const hasSubItems = (item) => {
  return item.subItems && item.subItems.length > 0
}

const hasNavigableRoute = (item) => {
  return typeof item?.route === 'string' && item.route.length > 0
}

const handleSubmenuClick = (item) => {
  const isSameOpenMenu = submenuOpen.value && currentSubmenu.value?.name === item.name

  if (isSameOpenMenu) {
    closeSubmenu()
    return
  }

  // UX: if a parent route exists, navigate there first, then open subitems.
  if (hasNavigableRoute(item)) {
    handleNavigation(item)
  }

  currentSubmenu.value = item
  submenuOpen.value = true
  searchQuery.value = ''
}

const closeSubmenu = () => {
  submenuOpen.value = false
  searchQuery.value = '' // Reset search when closing submenu
  currentSubmenu.value = null
}

const closeAllMenus = () => {
  closeSubmenu()
}

const handleSubmenuNavigation = (item) => {
  handleNavigation(item)
}

const handleSearch = (value) => {
  searchQuery.value = value
  emit('search', { query: value, menu: currentSubmenu.value?.name })
}

const clearSearch = () => {
  searchQuery.value = ''
}

const handleClickOutside = (event) => {
  if (!event.target.closest('[data-submenu-dropdown]')) {
    closeSubmenu()
  }
}

// Check if navigation item is active using passed currentPath prop
const isItemActive = (item) => {
  const currentPath = props.currentPath

  if (!item.route) {
    // For parent items with subItems, check if any subItem is active
    if (item.subItems && item.subItems.length > 0) {
      return item.subItems.some(subItem => {
        if (!subItem.route) return false
        return currentPath === subItem.route || currentPath.startsWith(subItem.route + '/')
      })
    }
    return false
  }

  if (currentPath === item.route) return true
  if (currentPath.startsWith(item.route + '/')) return true

  return false
}

const getActiveCardClasses = (active) => {
  if (!active) return 'ui-text hover:bg-(--ui-surface-muted) border border-transparent'
  if (props.themeScope === 'module') return 'border shadow-sm'
  return 'bg-[color:color-mix(in oklab, var(--ui-primary-soft), transparent 18%)] border border-(--ui-primary-soft) shadow-sm'
}

const getActiveCardStyle = (active) => {
  if (!active || props.themeScope !== 'module') return null
  return {
    backgroundColor: 'var(--module-soft, var(--ui-primary-soft))',
    borderColor: 'var(--module-border, var(--ui-border-strong))',
  }
}

const getActiveIconClasses = (active) => {
  if (!active) return 'ui-surface-muted ui-text-soft group-hover:text-(--ui-text) group-hover:bg-(--ui-primary-soft)'
  if (props.themeScope === 'module') return 'shadow-sm text-white'
  return 'ui-primary-bg shadow-sm'
}

const getActiveIconStyle = (active) => {
  if (!active) return null
  if (props.themeScope !== 'module') {
    return {
      color: '#ffffff',
    }
  }
  return {
    backgroundColor: 'var(--module-primary, var(--ui-primary))',
    color: '#ffffff',
    border: '1px solid var(--module-border, var(--ui-border-strong))',
  }
}

const getActiveTextClasses = (active) => {
  if (!active) return 'ui-text group-hover:text-(--ui-text)'
  if (props.themeScope === 'module') return 'ui-text font-semibold'
  return 'ui-primary font-semibold'
}

const getActiveTextStyle = () => {
  return null
}

// Handle responsive behavior
const checkMobile = () => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth < 1024

  if (wasMobile && !isMobile.value && isMobileOpen.value) {
    closeMobileSidebar()
  }
}

// Handle escape key to close mobile sidebar and menus
const handleEscape = (event) => {
  if (event.key === 'Escape') {
    if (submenuOpen.value) {
      closeAllMenus()
    } else if (isMobile.value && isMobileOpen.value) {
      closeMobileSidebar()
    }
  }
}

// Lifecycle
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  document.addEventListener('keydown', handleEscape)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('keydown', handleEscape)
  document.removeEventListener('click', handleClickOutside)
})

// Expose values for parent
defineExpose({
  isMobile,
  isMobileOpen,
  submenuOpen,
  contentMarginLeft,
  closeAllMenus
})
</script>

<template>
  <div>
    <!-- Mobile Overlay -->
    <transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileOpen && isMobile"
        class="fixed inset-0 z-30 lg:hidden bg-black/30 backdrop-blur-2xs"
        @click="closeMobileSidebar"
      />
    </transition>

    <!-- Sidebar -->
    <aside
      :class="cn(
        'fixed left-0 z-40 ui-surface border-r ui-border-strong overflow-visible flex flex-col shadow-xl shadow-black/5',
        'transition-transform duration-300 ease-out',
        props.themeScope === 'module' && 'kv-module-sidebar',
        isMobile
          ? cn('transform h-screen', isMobileOpen ? 'translate-x-0' : '-translate-x-full')
          : 'translate-x-0 h-[calc(100vh-4rem)]'
      )"
      :style="sidebarStyle"
    >
      <!-- Mobile Header with Close Button -->
      <div
        v-if="isMobile"
        class="flex ui-surface items-center justify-between p-4 border-b ui-border-strong shrink-0 lg:hidden"
      >
        <h2 class="text-base font-semibold ui-text">
          {{ header?.title }}
        </h2>
        <button
          class="p-2 rounded-lg ui-text hover:bg-(--ui-surface-muted) transition-colors"
          aria-label="Close sidebar"
          @click="closeMobileSidebar"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>


      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4">
        <div class="space-y-2">
          <template
            v-for="item in navigationItems"
            :key="item.name || item.label"
          >
            <!-- Navigation Links -->
            <div v-if="item.type === 'link'">
              <!-- Regular Link (no subitems) -->
              <router-link
                v-if="!hasSubItems(item)"
                :to="item.route"
                :class="cn(
                  'flex flex-col items-center justify-center rounded-xl transition-all duration-200 group relative py-3 px-2.5',
                  getActiveCardClasses(isItemActive(item))
                )"
                :style="getActiveCardStyle(isItemActive(item))"
                @click="handleNavigation(item)"
              >
                <!-- Icon Container -->
                <div
                  :class="cn(
                    'flex items-center justify-center rounded-lg transition-colors mb-2',
                    'w-10 h-10',
                    getActiveIconClasses(isItemActive(item))
                  )"
                  :style="getActiveIconStyle(isItemActive(item))"
                >
                  <Icon
                    :icon="item.icon"
                    class="w-5 h-5"
                    :style="isItemActive(item) ? { color: '#ffffff' } : null"
                  />
                </div>

                <!-- Label -->
                <span
                  :class="cn(
                    'text-[11px] leading-tight font-medium text-center',
                    getActiveTextClasses(isItemActive(item))
                  )"
                  :style="getActiveTextStyle(isItemActive(item))"
                >
                  {{ item.label }}
                </span>

                <!-- Badge -->
                <span
                  v-if="item.badge"
                  class="absolute top-1.5 right-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1 text-[10px] font-bold rounded-full ui-danger-bg ui-text-inverse"
                >
                  {{ item.badge }}
                </span>
              </router-link>

              <!-- Parent item with sub-items -->
              <div
                v-else
                class="relative"
                data-submenu-dropdown
              >
                <div
                  :class="cn(
                    'flex flex-col items-center justify-center rounded-xl transition-all duration-200 cursor-pointer group relative py-3 px-2.5',
                    getActiveCardClasses(isItemActive(item))
                  )"
                  :style="getActiveCardStyle(isItemActive(item))"
                  @click="handleSubmenuClick(item)"
                >
                  <!-- Icon Container -->
                  <div
                    :class="cn(
                      'flex items-center justify-center rounded-lg transition-colors mb-2',
                      'w-10 h-10',
                      getActiveIconClasses(isItemActive(item))
                    )"
                    :style="getActiveIconStyle(isItemActive(item))"
                  >
                    <Icon
                      :icon="item.icon"
                      class="w-5 h-5"
                      :style="isItemActive(item) ? { color: '#ffffff' } : null"
                    />
                  </div>

                  <!-- Label -->
                  <span
                    :class="cn(
                      'text-[11px] leading-tight font-medium text-center',
                      getActiveTextClasses(isItemActive(item))
                    )"
                    :style="getActiveTextStyle(isItemActive(item))"
                  >
                    {{ item.label }}
                  </span>

                  <!-- Badge -->
                  <span
                    v-if="item.badge"
                    class="absolute top-1.5 right-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1 text-[10px] font-bold rounded-full ui-danger-bg ui-text-inverse"
                  >
                    {{ item.badge }}
                  </span>

                  <!-- Active indicator dot for parent items -->
                  <div
                    v-if="isItemActive(item) && hasSubItems(item)"
                    class="absolute top-1.5 right-1.5 w-2 h-2 ui-primary-bg rounded-full"
                  />
                </div>
              </div>
            </div>
          </template>
        </div>
      </nav>

      <!-- Shared Submenu Dropdown -->
      <transition
        enter-active-class="transition-transform duration-250 ease-out"
        leave-active-class="transition-transform duration-200 ease-in"
        enter-from-class="-translate-x-full"
        enter-to-class="translate-x-0"
        leave-from-class="translate-x-0"
        leave-to-class="-translate-x-full"
      >
        <div
          v-if="submenuOpen && currentSubmenu && (!isMobile || isMobileOpen)"
          data-submenu-dropdown
          :class="cn('ui-surface border ui-border-strong shadow-2xl overflow-hidden z-50 fixed border-l rounded-none flex flex-col min-h-0')"
          :style="submenuDrawerStyle"
        >
          <div class="px-4 py-3 border-b ui-border-strong ui-surface-muted">
            <p class="text-sm font-semibold ui-text">
              {{ currentSubmenu.label }}
            </p>
          </div>

          <div
            v-if="shouldShowSubmenuSearch"
            class="px-4 pt-3 pb-2"
          >
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="searchPlaceholder"
                class="w-full px-3 py-2 pl-9 pr-9 text-sm border ui-border-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-(--ui-primary) focus:border-transparent transition-all ui-bg"
                @input="handleSearch(searchQuery)"
              >
              <div class="absolute left-3 top-1/2 transform -translate-y-1/2 ui-text-soft">
                <Icon
                  icon="search"
                  class="w-4 h-4"
                />
              </div>
              <button
                v-if="searchQuery"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 ui-text-soft hover:text-(--ui-text) transition-colors p-1"
                @click="clearSearch"
              >
                <Icon
                  icon="times"
                  class="w-4 h-4"
                />
              </button>
            </div>
          </div>

          <nav class="py-2 pb-16 flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <div
              v-if="shouldShowSubmenuSearch && searchQuery && filteredSubmenuItems.length === 0"
              class="px-4 py-6 text-center"
            >
              <p class="text-sm ui-text">
                No results found
              </p>
            </div>

            <template v-else>
              <router-link
                v-for="subItem in filteredSubmenuItems"
                :key="subItem.name"
                :to="subItem.route"
                :class="cn(
                  'mx-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isItemActive(subItem)
                    ? 'bg-[color:color-mix(in oklab, var(--ui-primary-soft), transparent 22%)] ui-primary'
                    : 'ui-text hover:bg-(--ui-surface-muted)'
                )"
                @click="handleSubmenuNavigation(subItem)"
              >
                <Icon
                  :icon="subItem.icon || 'circle'"
                  size="xl"
                />
                <span class="truncate text-xl">{{ subItem.label }}</span>
                <span
                  v-if="subItem.badge"
                  class="ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1 text-[10px] font-bold rounded-full ui-danger-bg ui-text-inverse"
                >
                  {{ subItem.badge }}
                </span>
              </router-link>
            </template>
          </nav>
        </div>
      </transition>
    </aside>
  </div>
</template>

<style scoped>
.kv-module-sidebar {
  background: color-mix(
    in oklab,
    var(--module-soft, var(--ui-primary-soft)) 45%,
    var(--ui-background) 55%
  );
}

.kv-module-sidebar :deep([data-submenu-dropdown]) {
  background: color-mix(
    in oklab,
    var(--module-soft-alt, var(--ui-accent-soft)) 50%,
    var(--ui-surface) 50%
  );
}
</style>
