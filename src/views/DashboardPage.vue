<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import Icon from '../components/Icon.vue'
import Card from '../components/Card.vue'
import LineChart from '../components/charts/LineChart.vue'
import BarChart from '../components/charts/BarChart.vue'
import StackedBarChart from '../components/charts/StackedBarChart.vue'
import RailNav from '../components/RailNav.vue'
import { THEME_PRESETS, getThemePreset } from '../lib/theme'

// Layout reference
const layoutRef = ref(null)

// Inject layout context (if needed for nested components)
const layoutContext = inject('dashboardLayout', null)

const companySwitcherDemoData = ref([
  {
    company_id: 201,
    company_name: 'Savannah Holdings',
    company_role: 'Primary',
    theme_preset: 'forest',
    theme: {
      primary: '#0f766e',
      secondary: ['#14b8a6', '#3b82f6', '#f97316']
    }
  },
  {
    company_id: 202,
    company_name: 'Rift Valley Energy',
    company_role: 'Subsidiary',
    theme_preset: 'ocean',
    theme: {
      primary: '#1d4ed8',
      secondary: ['#22c55e', '#8b5cf6', '#f59e0b']
    }
  },
  {
    company_id: 203,
    company_name: 'Coastal Trade Group',
    company_role: 'Partner',
    theme_preset: 'violet',
    theme: {
      primary: '#7c3aed',
      secondary: ['#ec4899', '#0ea5e9', '#eab308']
    }
  }
])

const selectedCompanyId = ref(companySwitcherDemoData.value[0]?.company_id || null)
const companyForm = ref({
  company_name: '',
  theme_preset: 'ocean',
  primary: '#0070f3',
  secondary_1: '#14b8a6',
  secondary_2: '#f97316',
  secondary_3: '#8b5cf6'
})
const latestThemePayload = ref(null)
const themePresets = THEME_PRESETS
const selectedPreset = computed(() => getThemePreset(companyForm.value.theme_preset))

const selectedCompany = computed(() => {
  return companySwitcherDemoData.value.find(c => c.company_id === selectedCompanyId.value) || null
})

const selectedCompanyTheme = computed(() => {
  return selectedCompany.value?.theme || {
    primary: '#0070f3',
    secondary: ['#14b8a6', '#f97316', '#8b5cf6']
  }
})

const applyCompaniesToLayout = () => {
  if (typeof layoutContext?.setCompanySwitcherDemoData !== 'function') return
  const currentCompany = selectedCompany.value || companySwitcherDemoData.value[0] || null
  layoutContext.setCompanySwitcherDemoData({
    companies: companySwitcherDemoData.value,
    currentCompany
  })
}

const loadThemeFormFromSelectedCompany = () => {
  if (!selectedCompany.value) return
  const theme = selectedCompanyTheme.value
  const secondaries = Array.isArray(theme.secondary) ? theme.secondary : []
  companyForm.value = {
    company_name: selectedCompany.value.company_name || '',
    theme_preset: selectedCompany.value.theme_preset || 'ocean',
    primary: theme.primary || '#0070f3',
    secondary_1: secondaries[0] || '#14b8a6',
    secondary_2: secondaries[1] || '#f97316',
    secondary_3: secondaries[2] || '#8b5cf6'
  }
}

const applyThemePreset = (presetKey = companyForm.value.theme_preset) => {
  const preset = getThemePreset(presetKey)
  const palette = preset.light
  companyForm.value.theme_preset = preset.key
  companyForm.value.primary = palette.primary
  companyForm.value.secondary_1 = palette.secondary[0]
  companyForm.value.secondary_2 = palette.secondary[1]
  companyForm.value.secondary_3 = palette.secondary[2]
}

const getPresetSwatchStyle = (preset) => {
  const palette = preset.light
  return {
    '--swatch-top-left': palette.primary,
    '--swatch-top-right': palette.secondary[0],
    '--swatch-bottom-left': palette.secondary[1],
    '--swatch-bottom-right': palette.secondary[2]
  }
}

const handleSelectedCompanyChange = () => {
  loadThemeFormFromSelectedCompany()
  applyCompaniesToLayout()
}

const upsertCompanyTheme = (persist = false) => {
  if (!selectedCompany.value) return
  const theme = {
    primary: companyForm.value.primary,
    secondary: [
      companyForm.value.secondary_1,
      companyForm.value.secondary_2,
      companyForm.value.secondary_3
    ]
  }

  companySwitcherDemoData.value = companySwitcherDemoData.value.map((company) => (
    company.company_id === selectedCompany.value.company_id
      ? {
        ...company,
        company_name: companyForm.value.company_name || company.company_name,
        theme_preset: companyForm.value.theme_preset,
        theme
      }
      : company
  ))

  applyCompaniesToLayout()

  const payload = {
    company_id: selectedCompany.value.company_id,
    theme: {
      preset: companyForm.value.theme_preset,
      primary_color: theme.primary,
      secondary_1: theme.secondary[0],
      secondary_2: theme.secondary[1],
      secondary_3: theme.secondary[2]
    }
  }

  latestThemePayload.value = payload

  if (persist && typeof layoutContext?.updateCompanyThemeInDemoData === 'function') {
    layoutContext.updateCompanyThemeInDemoData({
      companyId: payload.company_id,
      theme
    })
  }
}

const createCompanyWithTheme = () => {
  const nextId = Math.max(...companySwitcherDemoData.value.map(c => c.company_id), 200) + 1
  const newCompany = {
    company_id: nextId,
    company_name: companyForm.value.company_name || `Company ${nextId}`,
    company_role: 'New',
    theme_preset: companyForm.value.theme_preset,
    theme: {
      primary: companyForm.value.primary,
      secondary: [
        companyForm.value.secondary_1,
        companyForm.value.secondary_2,
        companyForm.value.secondary_3
      ]
    }
  }
  companySwitcherDemoData.value = [...companySwitcherDemoData.value, newCompany]
  selectedCompanyId.value = newCompany.company_id
  applyCompaniesToLayout()

  latestThemePayload.value = {
    company_id: newCompany.company_id,
    company_name: newCompany.company_name,
    theme: {
      preset: companyForm.value.theme_preset,
      primary_color: newCompany.theme.primary,
      secondary_1: newCompany.theme.secondary[0],
      secondary_2: newCompany.theme.secondary[1],
      secondary_3: newCompany.theme.secondary[2]
    }
  }
}

// Demo data
const stats = ref([
  {
    label: 'Total Users',
    value: '2,847',
    change: 12,
    trend: 'up',
    icon: 'users',
    bgColor: 'ui-primary-soft',
    iconColor: 'ui-primary'
  },
  {
    label: 'Revenue',
    value: '$45,231',
    change: 8,
    trend: 'up',
    icon: 'dollar-sign',
    bgColor: 'ui-success-soft',
    iconColor: 'ui-success'
  },
  {
    label: 'Orders',
    value: '1,423',
    change: 3,
    trend: 'down',
    icon: 'shopping-bag',
    bgColor: 'ui-warning-soft',
    iconColor: 'ui-warning'
  },
  {
    label: 'Conversion Rate',
    value: '3.24%',
    change: 15,
    trend: 'up',
    icon: 'percent',
    bgColor: 'ui-accent-soft',
    iconColor: 'ui-accent'
  }
])

const recentActivities = ref([
  {
    id: 1,
    user: { name: 'Alice Johnson', email: 'alice@example.com', initials: 'AJ' },
    action: 'Created new project',
    status: 'Completed',
    time: '2 minutes ago'
  },
  {
    id: 2,
    user: { name: 'Bob Smith', email: 'bob@example.com', initials: 'BS' },
    action: 'Updated user profile',
    status: 'In Progress',
    time: '15 minutes ago'
  },
  {
    id: 3,
    user: { name: 'Carol Davis', email: 'carol@example.com', initials: 'CD' },
    action: 'Deleted old files',
    status: 'Failed',
    time: '1 hour ago'
  },
  {
    id: 4,
    user: { name: 'David Wilson', email: 'david@example.com', initials: 'DW' },
    action: 'Exported data report',
    status: 'Completed',
    time: '2 hours ago'
  }
])

const revenueLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
const revenueData = [18, 24, 21, 29, 35, 42, 39, 47]

const userActivityLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const userActivityData = [120, 145, 132, 168, 176, 154, 162]
const riskStatusLabels = ['Risk']
const riskStatusData = [
  {
    open: 78,
    inProgress: 0,
    mitigated: 0
  }
]

const moduleThemePreviewVars = {
  '--module-primary': '#dc2626',
  '--module-soft': 'rgba(220, 38, 38, 0.11)',
  '--module-border': 'rgba(220, 38, 38, 0.30)',
  '--module-text': '#991b1b'
}

const railItems = ref([
  { id: 1, code: 'CBK', name: 'Central Bank' },
  { id: 2, code: 'CMA', name: 'Capital Markets' },
  { id: 3, code: 'KRA', name: 'Tax Authority' },
  { id: 4, code: 'NSSF', name: 'Social Security' }
])
const activeRailKey = ref('CBK')

const handleRailSelect = (item) => {
  activeRailKey.value = item?.code ?? item?.id
}

const handleRailSetupClick = () => {
  console.log('Setup clicked')
}

// Computed properties to track layout state
const sidebarCollapsed = computed(() => layoutRef.value?.sidebarCollapsed || false)
const sidebarWidth = computed(() => layoutRef.value?.sidebarWidth || 256)
const currentSection = computed(() => layoutContext?.currentSection?.value || 'Dashboard')
const currentPage = computed(() => layoutContext?.currentPage?.value || 'Demo')

// Methods
const toggleSidebar = () => {
  if (layoutRef.value) {
    layoutRef.value.toggleSidebar()
  }
}

const refreshData = () => {
  // Simulate data refresh
  console.log('Refreshing data...')
  // You would typically make API calls here
}


const getStatusColor = (status) => {
  const colors = {
    'Completed': 'ui-success-soft ui-success',
    'In Progress': 'ui-warning-soft ui-warning',
    'Failed': 'ui-danger-soft ui-danger',
    'Pending': 'ui-surface-muted ui-text'
  }
  return colors[status] || 'ui-surface-muted ui-text'
}

onMounted(() => {
  applyCompaniesToLayout()
  loadThemeFormFromSelectedCompany()
})
</script>

<template>
  <DashboardLayout
    ref="layoutRef"
    :user="user"
    initial-section="Dashboard"
    initial-page="Demo"
    @navigate="handleNavigation"
    @search="handleSearch"
    @profile-action="handleProfileAction"
    @logout="handleLogout"
    @sidebar-toggle="handleSidebarToggle"
  >
    <!-- Demo Content -->
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold ui-text">
            Dashboard Demo
          </h1>
          <p class="ui-text mt-1">
            Welcome to the Vue UI Dashboard demo page
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button
            class="px-4 py-2 ui-primary-bg ui-text rounded-lg hover:bg-(--ui-primary-strong) transition-colors"
            @click="toggleSidebar"
          >
            {{ sidebarCollapsed ? 'Expand' : 'Collapse' }} Sidebar
          </button>
          <button
            class="px-4 py-2 ui-surface-muted ui-text rounded-lg hover:bg-(--ui-bg) transition-colors"
            @click="refreshData"
          >
            Refresh Data
          </button>
        </div>
      </div>

      <Card variant="elevated">
        <div class="p-5 space-y-4">
          <h3 class="text-lg font-semibold ui-text">
            Rail Navigation Demo
          </h3>
          <div class="grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-4">
            <RailNav
              :items="railItems"
              :active-key="activeRailKey"
              title="Regulatory Bodies"
              setup-label="Open Setup"
              :show-setup="true"
              :desktop-only="false"
              height-offset="18rem"
              @select="handleRailSelect"
              @setup-click="handleRailSetupClick"
            />
            <div class="rounded-xl border ui-border-strong p-4 ui-surface">
              <p class="text-sm ui-text">
                Active Body:
                <span class="font-semibold">{{ activeRailKey }}</span>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="elevated">
        <div class="p-5 space-y-4">
          <h3 class="text-lg font-semibold ui-text">
            Theme Scope Showcase (Header + Sidebar Tokens)
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="rounded-xl border ui-border-strong p-4 ui-surface">
              <p class="text-sm font-semibold ui-text mb-2">
                Default Scope
              </p>
              <div class="border ui-border-strong rounded-lg overflow-hidden">
                <div class="px-3 py-2 border-b ui-border-strong bg-[color:color-mix(in_oklab,var(--ui-primary-soft),transparent_10%)]">
                  Header fallback: `ui-primary-soft`
                </div>
                <div class="p-3">
                  <div class="flex items-center gap-3 rounded-lg border ui-border-strong px-3 py-2 bg-[color:color-mix(in_oklab,var(--ui-primary-soft),transparent_18%)]">
                    <span class="w-7 h-7 rounded-lg ui-primary-bg text-white inline-flex items-center justify-center">I</span>
                    <span class="font-semibold ui-primary">Sidebar active item</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="rounded-xl border ui-border-strong p-4 ui-surface"
              :style="moduleThemePreviewVars"
            >
              <p class="text-sm font-semibold ui-text mb-2">
                Module Scope
              </p>
              <div
                class="border rounded-lg overflow-hidden"
                style="border-color: var(--module-border);"
              >
                <div
                  class="px-3 py-2 border-b bg-[color:color-mix(in_oklab,var(--module-soft,var(--ui-primary-soft)),transparent_10%)]"
                  style="border-color: var(--module-border); color: var(--module-text);"
                >
                  Header fallback: `module-soft -> ui-primary-soft`
                </div>
                <div class="p-3">
                  <div
                    class="flex items-center gap-3 rounded-lg border px-3 py-2"
                    style="border-color: var(--module-border); background: var(--module-soft); color: var(--module-text);"
                  >
                    <span
                      class="w-7 h-7 rounded-lg text-white inline-flex items-center justify-center"
                      style="background: var(--module-primary);"
                    >I</span>
                    <span class="font-semibold">Sidebar active item</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="elevated">
        <div class="p-5 space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <h3 class="text-lg font-semibold ui-text">
              Company Theme Configuration
            </h3>
            <span class="text-xs ui-text-muted">Primary + 3 secondary colors per company</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <label class="lg:col-span-2">
              <span class="block text-xs font-medium ui-text mb-1">Select Company</span>
              <select
                v-model.number="selectedCompanyId"
                class="w-full rounded-lg border ui-border-strong ui-surface px-3 py-2 text-sm ui-text"
                @change="handleSelectedCompanyChange"
              >
                <option
                  v-for="company in companySwitcherDemoData"
                  :key="company.company_id"
                  :value="company.company_id"
                >
                  {{ company.company_name }}
                </option>
              </select>
            </label>

            <label class="lg:col-span-2">
              <span class="block text-xs font-medium ui-text mb-1">Company Name</span>
              <input
                v-model="companyForm.company_name"
                type="text"
                class="w-full rounded-lg border ui-border-strong ui-surface px-3 py-2 text-sm ui-text"
                placeholder="Company name"
              >
            </label>

            <div class="lg:col-span-6">
              <span class="block text-xs font-medium ui-text mb-2">Pick a Theme Colour</span>
              <div class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                <button
                  v-for="preset in themePresets"
                  :key="preset.key"
                  class="relative rounded-xl border ui-border-strong p-2 ui-surface hover:bg-(--ui-surface-muted) transition-colors"
                  :class="companyForm.theme_preset === preset.key ? 'ring-2 ring-(--ui-primary) ring-offset-1' : ''"
                  :title="preset.name"
                  @click="applyThemePreset(preset.key)"
                >
                  <span
                    class="block w-10 h-10 sm:w-11 sm:h-11 mx-auto rounded-full overflow-hidden border border-black/10"
                    :style="getPresetSwatchStyle(preset)"
                  >
                    <span class="block w-1/2 h-1/2 float-left bg-(--swatch-top-left)" />
                    <span class="block w-1/2 h-1/2 float-left bg-(--swatch-top-right)" />
                    <span class="block w-1/2 h-1/2 float-left bg-(--swatch-bottom-left)" />
                    <span class="block w-1/2 h-1/2 float-left bg-(--swatch-bottom-right)" />
                  </span>
                  <Icon
                    v-if="companyForm.theme_preset === preset.key"
                    icon="check"
                    class="absolute -top-1 -right-1 w-4 h-4 ui-primary-bg rounded-full p-0.5"
                  />
                </button>

                <div class="rounded-xl border ui-border-strong p-2 ui-surface">
                  <span class="block w-10 h-10 sm:w-11 sm:h-11 mx-auto rounded-full border border-black/10 bg-(--ui-primary-soft) relative">
                    <span class="absolute inset-0 m-auto w-fit h-fit text-sm font-bold ui-primary">+</span>
                  </span>
                </div>
              </div>
              <p class="text-xs ui-text-muted mt-2">
                Selected: {{ selectedPreset.name }} (you can still tweak colors below)
              </p>
            </div>

            <label>
              <span class="block text-xs font-medium ui-text mb-1">Primary</span>
              <input
                v-model="companyForm.primary"
                type="color"
                class="w-full h-10 rounded-lg border ui-border-strong ui-surface p-1 cursor-pointer"
              >
            </label>

            <label>
              <span class="block text-xs font-medium ui-text mb-1">Secondary 1</span>
              <input
                v-model="companyForm.secondary_1"
                type="color"
                class="w-full h-10 rounded-lg border ui-border-strong ui-surface p-1 cursor-pointer"
              >
            </label>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <label>
              <span class="block text-xs font-medium ui-text mb-1">Secondary 2</span>
              <input
                v-model="companyForm.secondary_2"
                type="color"
                class="w-full h-10 rounded-lg border ui-border-strong ui-surface p-1 cursor-pointer"
              >
            </label>
            <label>
              <span class="block text-xs font-medium ui-text mb-1">Secondary 3</span>
              <input
                v-model="companyForm.secondary_3"
                type="color"
                class="w-full h-10 rounded-lg border ui-border-strong ui-surface p-1 cursor-pointer"
              >
            </label>

            <button
              class="self-end px-4 py-2 rounded-lg ui-primary-bg hover:bg-(--ui-primary-strong) transition-colors text-sm font-medium"
              @click="upsertCompanyTheme(true)"
            >
              Save Theme (DB Payload)
            </button>

            <button
              class="self-end px-4 py-2 rounded-lg border ui-border-strong ui-surface hover:bg-(--ui-surface-muted) transition-colors text-sm font-medium ui-text"
              @click="createCompanyWithTheme"
            >
              Create Company With Theme
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="rounded-xl border ui-border-strong p-4 ui-surface-muted">
              <p class="text-sm font-semibold ui-text mb-3">
                Live Preview
              </p>
              <div
                class="rounded-lg p-4 border ui-border-strong"
                :style="{ background: 'var(--ui-surface)' }"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="font-semibold ui-text">
                    {{ companyForm.company_name || 'Company' }}
                  </div>
                  <span
                    class="px-2 py-1 rounded text-xs"
                    :style="{ backgroundColor: companyForm.primary, color: '#fff' }"
                  >Primary</span>
                </div>
                <div class="flex gap-2 mb-3">
                  <span
                    class="h-6 w-6 rounded-full border ui-border-strong"
                    :style="{ backgroundColor: companyForm.secondary_1 }"
                  />
                  <span
                    class="h-6 w-6 rounded-full border ui-border-strong"
                    :style="{ backgroundColor: companyForm.secondary_2 }"
                  />
                  <span
                    class="h-6 w-6 rounded-full border ui-border-strong"
                    :style="{ backgroundColor: companyForm.secondary_3 }"
                  />
                </div>
                <button
                  class="px-3 py-1.5 rounded text-xs font-semibold"
                  :style="{ backgroundColor: companyForm.primary, color: '#fff' }"
                >
                  Action Button
                </button>
              </div>
            </div>

            <div class="rounded-xl border ui-border-strong p-4 ui-surface-muted">
              <p class="text-sm font-semibold ui-text mb-3">
                DB Payload
              </p>
              <pre class="text-xs ui-text overflow-auto">{{ JSON.stringify(latestThemePayload, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </Card>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          v-for="stat in stats"
          :key="stat.label"
          variant="elevated"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium ui-text">
                {{ stat.label }}
              </p>
              <p class="text-2xl font-bold ui-text mt-1">
                {{ stat.value }}
              </p>
            </div>
            <div :class="`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bgColor}`">
              <Icon
                :icon="stat.icon"
                :class="`w-6 h-6 ${stat.iconColor}`"
              />
            </div>
          </div>
          <div class="flex items-center mt-4">
            <span :class="`text-sm font-medium ${stat.trend === 'up' ? 'ui-success' : 'ui-danger'}`">
              {{ stat.trend === 'up' ? '+' : '-' }}{{ stat.change }}%
            </span>
            <span class="text-sm ui-text ml-2">from last month</span>
          </div>
        </Card>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Chart 1 -->
        <Card variant="elevated">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold ui-text">
              Revenue Overview
            </h3>
            <select class="text-sm border ui-border-strong rounded-lg px-3 py-2">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div class="h-64 ui-surface-muted rounded-lg flex items-center justify-center">
            <LineChart
              :data="revenueData"
              :labels="revenueLabels"
              :width="560"
              :height="260"
              line-color="var(--ui-primary)"
              value-suffix="%"
              x-axis-label="Month"
              y-axis-label="Revenue Growth %"
            />
          </div>
        </Card>

        <!-- Chart 2 -->
        <Card variant="elevated">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold ui-text">
              User Activity
            </h3>
            <div class="flex items-center space-x-2">
              <span class="inline-flex items-center w-3 h-3 ui-primary-bg rounded-full" />
              <span class="text-sm ui-text">Active Users</span>
            </div>
          </div>
          <div class="h-64 ui-surface-muted rounded-lg flex items-center justify-center">
            <BarChart
              :data="userActivityData"
              :labels="userActivityLabels"
              :width="560"
              :height="260"
              :colors="['#22c55e', '#34d399', '#4ade80', '#86efac', '#16a34a', '#15803d', '#166534']"
              series-label="Active Users"
              value-suffix=""
              x-axis-label="Day"
              y-axis-label="Users"
            />
          </div>
        </Card>
      </div>

      <!-- Zero value demonstration -->
      <Card variant="elevated">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold ui-text">
            Risk Status (0% Visibility Demo)
          </h3>
          <span class="text-sm ui-text">Only one status has value</span>
        </div>
        <div class="h-64 ui-surface-muted rounded-lg flex items-center justify-center p-2">
          <StackedBarChart
            :data="riskStatusData"
            :labels="riskStatusLabels"
            :width="560"
            :height="260"
            :colors="['#ef4444', '#f59e0b', '#22c55e']"
            :group-keys="['open', 'inProgress', 'mitigated']"
            :legend-labels="['Open', 'In Progress', 'Mitigated']"
            :max-value="100"
            value-suffix="%"
            y-axis-label="Percentage (%)"
          />
        </div>
      </Card>

      <!-- Recent Activity Table -->
      <Card variant="elevated">
        <div class="p-6 border-b ui-border-strong">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold ui-text">
              Recent Activity
            </h3>
            <button class="text-sm ui-primary hover:text-(--ui-primary)">
              View all
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="ui-surface-muted">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium ui-text uppercase tracking-wider">
                  User
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium ui-text uppercase tracking-wider">
                  Action
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium ui-text uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium ui-text uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody class="ui-surface divide-y divide-gray-200">
              <tr
                v-for="activity in recentActivities"
                :key="activity.id"
                class="hover:bg-(--ui-surface)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-8 h-8 ui-bg rounded-full flex items-center justify-center">
                      <span class="text-xs font-medium ui-text">{{ activity.user.initials }}</span>
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium ui-text">
                        {{ activity.user.name }}
                      </div>
                      <div class="text-sm ui-text">
                        {{ activity.user.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm ui-text">
                    {{ activity.action }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(activity.status)}`">
                    {{ activity.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ui-text">
                  {{ activity.time }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <!-- Debug Info -->
      <Card variant="filled">
        <h4 class="font-medium ui-text mb-2">
          Layout Debug Info
        </h4>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="font-medium">Sidebar Collapsed:</span> {{ sidebarCollapsed }}
          </div>
          <div>
            <span class="font-medium">Sidebar Width:</span> {{ sidebarWidth }}px
          </div>
          <div>
            <span class="font-medium">Current Section:</span> {{ currentSection }}
          </div>
          <div>
            <span class="font-medium">Current Page:</span> {{ currentPage }}
          </div>
        </div>
      </Card>
    </div>
  </DashboardLayout>
</template>
