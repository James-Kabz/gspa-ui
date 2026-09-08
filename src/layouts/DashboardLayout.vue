<script setup>
import { ref, computed, watch, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
import { setTheme } from '../lib/theme'

const router = useRouter()
const route = useRoute()

// Props
const props = defineProps({
  user: {
    type: Object,
    default: () => ({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Administrator'
    })
  },
  initialSection: {
    type: String,
    default: 'Dashboard'
  },
  initialPage: {
    type: String,
    default: 'Overview'
  }
})

// State
const sidebarRef = ref(null)
const currentSection = ref(props.initialSection)
const currentPage = ref(props.initialPage)
const currentRoute = ref(route.path)
const mobileOpen = ref(false)
const demoCompanies = ref([])
const demoCurrentCompany = ref(null)
const selectedCompany = ref(null)

const fallbackCompanies = [
  {
    company_id: 101,
    company_name: 'Acme Holdings Ltd',
    company_role: 'Primary',
    theme: {
      primary: '#1d4ed8',
      secondary: ['#0ea5e9', '#22c55e', '#f59e0b']
    }
  },
  {
    company_id: 102,
    company_name: 'Bluewave Logistics',
    company_role: 'Subsidiary',
    theme: {
      primary: '#0f766e',
      secondary: ['#14b8a6', '#6366f1', '#f97316']
    }
  },
  {
    company_id: 103,
    company_name: 'Northwind Services',
    company_role: 'Partner',
    theme: {
      primary: '#7c3aed',
      secondary: ['#a855f7', '#3b82f6', '#ef4444']
    }
  }
]

// Emits
const emit = defineEmits([
  'navigate',
  'search',
  'profile-action',
  'logout',
  'company-change',
  'company-theme-save'
])

const profileMenuItems = [
  {
    name: 'profile',
    label: 'Profile',
    route: 'profile',
    icon: 'user'
  },
  {
    name: 'settings',
    label: 'Settings',
    route: 'settings',
    icon: 'cog'
  },
]

// Navigation items configuration
const navigationItems = [
  {
    type: 'section',
    label: 'Dashboard'
  },
  {
    type: 'link',
    name: 'dashboard',
    label: 'Dashboard',
    route: '/dashboard',
    icon: 'home'
  },
  {
    type: 'link',
    name: 'analytics',
    label: 'Analytics',
    route: '/analytics',
    icon: 'user',
    badge: '2'
  },
  {
    type: 'section',
    label: 'Management'
  },
  {
    type: 'link',
    name: 'users',
    label: 'User Management',
    icon: 'users',
    subItems: [
      {
        name: 'all-users',
        label: 'All Users',
        route: '/users',
        icon: 'user'
      },
      {
        name: 'roles',
        label: 'Roles & Permissions',
        route: '/users/roles',
        icon: 'shield'
      },
      {
        name: 'activity',
        label: 'User Activity',
        route: '/users/activity',
        icon: 'activity'
      }
    ]
  },
  {
    type: 'link',
    name: 'roles',
    label: 'Roles & Permissions',
    route: '/roles',
    icon: 'cogs'
  },
]

// Computed
const sidebarWidth = computed(() => 130)
const resolvedCompanies = computed(() => {
  if (Array.isArray(props.user?.companies) && props.user.companies.length > 0) return props.user.companies
  if (demoCompanies.value.length > 0) return demoCompanies.value
  return fallbackCompanies
})

const resolvedCurrentCompany = computed(() => {
  return selectedCompany.value
    || props.user?.currentCompany
    || props.user?.company
    || demoCurrentCompany.value
    || resolvedCompanies.value[0]
    || null
})

const setCompanySwitcherDemoData = ({ companies = [], currentCompany = null } = {}) => {
  demoCompanies.value = Array.isArray(companies) ? companies : []
  demoCurrentCompany.value = currentCompany || demoCompanies.value[0] || null
  selectedCompany.value = demoCurrentCompany.value
}

const updateCompanyThemeInDemoData = ({ companyId, theme }) => {
  if (!companyId || !theme) return
  demoCompanies.value = resolvedCompanies.value.map((company) => {
    const id = company?.company_id || company?.companyId || company?.id
    if (id !== companyId) return company
    return { ...company, theme }
  })
  emit('company-theme-save', { company_id: companyId, theme })
}

provide('dashboardLayout', {
  currentSection,
  currentPage,
  setCompanySwitcherDemoData,
  updateCompanyThemeInDemoData
})

const getCompanyTheme = (company) => {
  if (!company || typeof company !== 'object') return null
  return company.theme || company.company_theme || null
}

const resolveEntityLogo = (entity) => {
  if (!entity || typeof entity !== 'object') return ''
  return entity.logo || entity.company_logo || ''
}

const resolvedCompanyLogo = computed(() => {
  return props.user?.companyLogo || props.user?.company_logo || props.user?.brandLogo || ''
})

const resolvedCurrentCompanyLogo = computed(() => {
  return resolveEntityLogo(resolvedCurrentCompany.value) || resolveEntityLogo(resolvedCompanies.value[0]) || ''
})

const resolvedAppLogoUrl = computed(() => {
  return props.user?.logoUrl || props.user?.appLogo || '/applogo.png'
})

const locationTrail = computed(() => {
  const base = 'eBoard'
  const path = String(currentRoute.value || '').replace(/^\/+|\/+$/g, '')
  if (!path) return base

  const segments = path
    .split('/')
    .filter(Boolean)
    .map((segment) =>
      segment
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
    )

  return [base, ...segments].join(' / ')
})

// Methods
const handleMobileSidebarToggle = () => {
  mobileOpen.value = !mobileOpen.value
}

const handleMobileToggle = (value) => {
  mobileOpen.value = value
}

const handleNavigation = (item) => {
  if (item.route) {
    router.push(item.route)
  }
  emit('navigate', item)
}

const updateBreadcrumbFromRoute = (routePath) => {
  const sectionMap = {
    '/dashboard': { section: 'Dashboard', page: 'Overview' },
    '/analytics': { section: 'Dashboard', page: 'Analytics' },
    '/users': { section: 'Management', page: 'Users' },
    '/roles': { section: 'Management', page: 'Roles & Permissions' },
    '/management': { section: 'Management', page: 'Settings' },
    '/management/system-settings': { section: 'Management', page: 'System Settings' },
    '/management/user-management': { section: 'Management', page: 'User Management' },
    '/management/permissions': { section: 'Management', page: 'Permissions' },
    '/management/audit-logs': { section: 'Management', page: 'Audit Logs' },
    '/management/backup': { section: 'Management', page: 'Backup & Restore' }
  }

  const breadcrumb = sectionMap[routePath] || { section: 'Dashboard', page: 'Overview' }
  currentSection.value = breadcrumb.section
  currentPage.value = breadcrumb.page
}

const handleSearch = (query) => {
  emit('search', query)
}

const handleProfileAction = (action) => {
  emit('profile-action', action)
}

const handleLogout = () => {
  emit('logout')
}

const handleCompanyChange = (company) => {
  selectedCompany.value = company
  emit('company-change', company)
}

watch(resolvedCurrentCompany, (company) => {
  setTheme(getCompanyTheme(company), { persist: false })
}, { immediate: true })

// Watch for route changes
watch(() => route.path, (newPath) => {
  currentRoute.value = newPath
  updateBreadcrumbFromRoute(newPath)
}, { immediate: true })

// Expose methods for parent components
defineExpose({
  navigate: handleNavigation,
  updateCurrentPage: (section, page) => {
    currentSection.value = section
    currentPage.value = page
  }
})
</script>

<template>
  <div class="min-h-screen ui-surface-muted">
    <!-- Sidebar -->
    <Sidebar
      ref="sidebarRef"
      :sidebar-width="sidebarWidth"
      :header="{ title: 'Risk & Compliance' }"
      :navigation-items="navigationItems"
      :mobile-open="mobileOpen"
      :current-path="currentRoute"
      @navigate="handleNavigation"
      @update:mobile-open="handleMobileToggle"
    />

    <!-- Header -->
    <Header
      :sidebar-width="sidebarWidth"
      :current-section="currentSection"
      :current-page="currentPage"
      :current-route="currentRoute"
      :user="user"
      :notifications="[]"
      :profile-menu-items="profileMenuItems"
      :mobile-open="mobileOpen"
      :current-company="resolvedCurrentCompany"
      :company-logo="resolvedCompanyLogo"
      :current-company-logo="resolvedCurrentCompanyLogo"
      :companies="resolvedCompanies"
      :logo-url="resolvedAppLogoUrl"
      :show-search="false"
      settings-route="/management/system-settings"
      @search="handleSearch"
      @profile-action="handleProfileAction"
      @logout="handleLogout"
      @navigate="handleNavigation"
      @toggle-mobile-sidebar="handleMobileSidebarToggle"
      @company-change="handleCompanyChange"
    />

    <!-- Main Content -->
    <main
      class="transition-all duration-300 ease-in-out pt-14 min-h-screen"
      :style="{ marginLeft: sidebarRef?.contentMarginLeft + 'px' }"
    >
      <div class="p-6">
        <p class="mb-4 text-sm ui-text-muted">
          <span class="font-semibold ui-text">You are here:</span> {{ locationTrail }}
        </p>
        <router-view />
      </div>
    </main>
  </div>
</template>
