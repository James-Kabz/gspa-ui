<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { cn } from '../utils/cn.js'
import { getMode, setMode } from '../lib/theme'
import Icon from './Icon.vue'
import Search from './Search.vue'
import Switch from './Switch.vue'

const props = defineProps({
  sidebarWidth: { type: Number, default: 256 },
  currentSection: { type: String, default: 'Dashboard' },
  currentPage: { type: String, default: 'Overview' },
  currentRoute: { type: String, default: '' },
  user: { type: Object, required: true },
  notifications: { type: Array, default: () => [] },
  profileMenuItems: { type: Array, required: true },
  mobileOpen: { type: Boolean, default: false },
  currentCompany: { type: Object, default: null },
  companyLogo: { type: String, default: '/logo.png' },
  currentCompanyLogo: { type: String, default: '' },
  companyLogos: { type: Object, default: () => ({}) },
  companies: { type: Array, default: () => [] },
  activeRoles: { type: Array, default: () => [] },
  showSearch: { type: Boolean, default: true },
  showNotifications: { type: Boolean, default: true },
  showBreadcrumb: { type: Boolean, default: true },
  showCompanyInfo: { type: Boolean, default: true },
  showHeaderLogo: { type: Boolean, default: true },
  logoUrl: { type: String, default: '/applogo.png' },
  headerLogo: { type: String, default: '/logo.png' },
  companyLogoClass: { type: String, default: 'h-16 sm:h-22 md:h-22' },
  searchPlaceholder: { type: String, default: 'Search...' },
  notificationsTitle: { type: String, default: 'Notifications' },
  companySwitcherTitle: { type: String, default: 'Switch Company' },
  companySwitcherDescription: { type: String, default: 'Select a company to view its data' },
  entityLabel: { type: String, default: 'Company' },
  entityFieldMap: { type: Object, default: () => ({}) },
  showSettings: { type: Boolean, default: true },
  settingsLabel: { type: String, default: 'Settings' },
  settingsRoute: { type: [String, Object], default: '/settings' },
  showThemeSwitcher: { type: Boolean, default: true },
  themeSwitcherTitle: { type: String, default: 'Appearance' },
  themeModes: {
    type: Array,
    default: () => ['light', 'dark']
  },
  userInitialsOverride: { type: String, default: '' },
  userRoleDisplayOverride: { type: String, default: '' },
  userAvatarUrl: { type: String, default: '' },
  userAvatarAlt: { type: String, default: '' },
  showUserAvatar: { type: Boolean, default: true },
  themeScope: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'module'].includes(value)
  }
})

const emit = defineEmits([
  'search',
  'profile-action',
  'logout',
  'navigate',
  'toggle-mobile-sidebar',
  'company-change',
  'notification-click',
  'view-all-notifications',
  'theme-change'
])

const searchQuery = ref('')
const showNotificationsDropdown = ref(false)
const showProfile = ref(false)
const isMobile = ref(false)
const showCompanyDropdown = ref(false)
const currentThemeMode = ref('light')
const displayedCompanyLogoSrc = ref('/logo.png')
const avatarLoadFailed = ref(false)

const notificationCount = computed(() => props.notifications.filter(n => !n.read).length)
const resolvedThemeModes = computed(() => {
  const modes = (Array.isArray(props.themeModes) ? props.themeModes : [])
    .map(mode => String(mode || '').toLowerCase())
    .filter(mode => mode === 'light' || mode === 'dark')
  return modes.length > 0 ? [...new Set(modes)] : ['light', 'dark']
})
const canToggleTheme = computed(() => resolvedThemeModes.value.length > 1)
const isDarkTheme = computed({
  get: () => currentThemeMode.value === 'dark',
  set: (value) => {
    const targetMode = value ? 'dark' : 'light'
    if (resolvedThemeModes.value.includes(targetMode)) {
      setThemeMode(targetMode)
    }
  }
})

const userInitials = computed(() => {
  if (props.userInitialsOverride) return props.userInitialsOverride
  const name = props.user?.name || 'Guest'
  return name.split(' ').map(n => n[0] || '').join('').toUpperCase()
})

const resolvedUserAvatarUrl = computed(() => {
  if (!props.showUserAvatar) return ''
  return props.userAvatarUrl || ''
})

const showAvatarImage = computed(() => Boolean(resolvedUserAvatarUrl.value) && !avatarLoadFailed.value)

const resolvedUserAvatarAlt = computed(() => props.userAvatarAlt || `${props.user?.name || 'User'} avatar`)

const handleAvatarError = () => {
  avatarLoadFailed.value = true
}

const entityLabelLower = computed(() => String(props.entityLabel || 'Company').toLowerCase())
const resolvedShowCompanyInfo = computed(() => props.showCompanyInfo)
const resolvedSwitcherTitle = computed(() => props.companySwitcherTitle || `Switch ${props.entityLabel || 'Company'}`)
const resolvedSwitcherDescription = computed(() => {
  return props.companySwitcherDescription || `Select a ${(props.entityLabel || 'Company').toLowerCase()} to view its data`
})

const resolvedFieldMap = computed(() => ({
  id: props.entityFieldMap?.id || '',
  name: props.entityFieldMap?.name || '',
  role: props.entityFieldMap?.role || '',
  type: props.entityFieldMap?.type || '',
  typeName: props.entityFieldMap?.typeName || ''
}))

const companyIdAliases = ['company_id', 'companyId', 'id']
const companyNameAliases = ['company_name', 'companyName', 'name']
const companyRoleAliases = ['company_role', 'companyRole', 'role']
const companyTypeAliases = ['company_type', 'companyType', 'type']
const companyTypeNameAliases = ['name', 'label', 'title', 'company_type_name', 'companyTypeName']

const getFieldValue = (obj, preferredKey, aliases = []) => {
  if (!obj || typeof obj !== 'object') return null
  if (preferredKey && obj[preferredKey] != null) return obj[preferredKey]
  for (const key of aliases) {
    if (obj[key] != null) return obj[key]
  }
  return null
}

const getCompanyTypeName = (company) => {
  if (!company || typeof company !== 'object') return ''

  const typeValue = getFieldValue(company, resolvedFieldMap.value.type, companyTypeAliases)
  if (typeof typeValue === 'string') return typeValue

  if (typeValue && typeof typeValue === 'object') {
    const nestedTypeName = getFieldValue(typeValue, resolvedFieldMap.value.typeName, companyTypeNameAliases)
    if (nestedTypeName != null) return String(nestedTypeName)
  }

  const directTypeName = getFieldValue(company, resolvedFieldMap.value.typeName, companyTypeNameAliases)
  if (directTypeName != null) return String(directTypeName)
  return ''
}

const normalizeCompany = (company) => {
  if (!company || typeof company !== 'object') return null

  const id = getFieldValue(company, resolvedFieldMap.value.id, companyIdAliases)
  const name = getFieldValue(company, resolvedFieldMap.value.name, companyNameAliases)
  const role = getFieldValue(company, resolvedFieldMap.value.role, companyRoleAliases)

  return {
    ...company,
    __id: id,
    __name: name != null ? String(name) : 'Unknown',
    __role: role != null ? String(role) : '',
    __typeName: getCompanyTypeName(company),
    __raw: company
  }
}

const sourceCurrentCompany = computed(() => props.currentCompany)
const sourceCompanies = computed(() => (Array.isArray(props.companies) ? props.companies : []))
const normalizedCurrentCompany = computed(() => normalizeCompany(sourceCurrentCompany.value))
const normalizedCompanies = computed(() => sourceCompanies.value.map(normalizeCompany).filter(Boolean))

const toggleNotifications = () => {
  showNotificationsDropdown.value = !showNotificationsDropdown.value
  showProfile.value = false
}

const toggleProfile = () => {
  showProfile.value = !showProfile.value
  showNotificationsDropdown.value = false
  showCompanyDropdown.value = false
}

const toggleCompanyDropdown = () => {
  showCompanyDropdown.value = !showCompanyDropdown.value
  showProfile.value = false
  showNotificationsDropdown.value = false
}

const handleNavigation = (item) => {
  emit('navigate', item)
  showProfile.value = false
}

const isItemActive = (item) => {
  if (!item.route) return false
  if (props.currentRoute === item.route) return true
  if (props.currentRoute.startsWith(item.route + '/')) return true
  return false
}


const getHeaderClass = () => {
  if (props.themeScope === 'module') {
    return 'border-b ui-border-strong bg-[color:color-mix(in oklab, var(--module-soft, var(--ui-primary-soft)), transparent 10%)]'
  }
  return 'border-b ui-border-strong bg-[color:color-mix(in oklab, var(--module-soft, var(--ui-primary-soft)), transparent 8%)]'
}

const getHeaderActiveItemClasses = (active) => {
  if (!active) return 'ui-text hover:bg-(--ui-surface-muted) hover:text-(--ui-text) border border-transparent'
  if (props.themeScope === 'module') return 'shadow-sm border'
  return 'bg-linear-to-br from-(--ui-primary-soft) to-(--ui-primary-soft) ui-primary shadow-sm border border-(--ui-primary-soft)'
}

const getHeaderActiveItemStyle = (active) => {
  if (!active || props.themeScope !== 'module') return null
  return {
    backgroundColor: 'var(--module-soft, var(--ui-primary-soft))',
    borderColor: 'var(--module-border, var(--ui-border-strong))',
  }
}

const getHeaderActiveIndicatorStyle = (active) => {
  if (!active || props.themeScope !== 'module') return null
  return { background: 'var(--module-primary, var(--ui-primary))' }
}

const getHeaderActiveIconClasses = (active) => {
  if (!active) return 'ui-surface-muted ui-text group-hover:bg-(--ui-bg)'
  if (props.themeScope === 'module') return 'shadow-md border'
  return 'bg-linear-to-br from-(--ui-primary) to-(--ui-primary) ui-text shadow-md'
}

const getHeaderActiveIconStyle = (active) => {
  if (!active || props.themeScope !== 'module') return null
  return {
    backgroundColor: 'var(--module-primary, var(--ui-primary))',
    color: 'var(--ui-text-inverse, #fff)',
    borderColor: 'var(--module-border, var(--ui-border-strong))',
  }
}

const getHeaderActiveTextClasses = (active) => {
  if (!active) return 'ui-text'
  if (props.themeScope === 'module') return 'font-semibold'
  return 'ui-primary'
}

const getHeaderActiveTextStyle = (active) => {
  if (!active || props.themeScope !== 'module') return null
  return { color: 'var(--module-text, var(--ui-primary))' }
}


const getCompanyRowClasses = (selected) => {
  if (!selected) return 'ui-text border-transparent hover:bg-(--ui-surface-muted)'
  if (props.themeScope === 'module') return 'border shadow-sm font-semibold'
  return 'bg-[color:color-mix(in oklab, var(--ui-primary-soft), transparent 25%)] ui-primary border-(--ui-primary-soft)'
}

const getCompanyRowStyle = (selected) => {
  if (!selected || props.themeScope !== 'module') return null
  return {
    backgroundColor: 'var(--module-soft, var(--ui-primary-soft))',
    borderColor: 'var(--module-border, var(--ui-border-strong))',
    color: 'var(--module-text, var(--ui-primary))',
  }
}

const getCompanyCheckStyle = (selected) => {
  if (!selected || props.themeScope !== 'module') return null
  return { color: 'var(--module-primary, var(--ui-primary))' }
}

const handleProfileAction = (item) => {
  emit('profile-action', item)
  showProfile.value = false
}

const handleLogout = () => {
  emit('logout')
  showProfile.value = false
}

const handleCompanyChange = (company) => {
  const selectedCompany = company?.__raw || company
  emit('company-change', selectedCompany)
  showCompanyDropdown.value = false
}

const handleNotificationClick = (notification) => {
  emit('notification-click', notification)
}

const handleViewAllNotifications = () => {
  emit('view-all-notifications')
  showNotificationsDropdown.value = false
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.absolute') && !event.target.closest('button')) {
    showNotificationsDropdown.value = false
    showProfile.value = false
    showCompanyDropdown.value = false
  }
}

const setThemeMode = (mode) => {
  if (!resolvedThemeModes.value.includes(mode)) return
  currentThemeMode.value = mode
  setMode(mode)
  emit('theme-change', mode)
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const getNotificationTypeClass = (notification) => {
  if (notification.title.includes('Overdue')) return 'ui-danger-soft ui-danger'
  if (notification.title.includes('Due in 0')) return 'ui-warning-soft ui-warning'

  const classes = {
    due_date_reminder: 'ui-warning-soft ui-warning',
    info: 'ui-primary-soft ui-primary',
    success: 'ui-success-soft ui-success',
    warning: 'ui-warning-soft ui-warning',
    error: 'ui-danger-soft ui-danger'
  }

  return classes[notification.type] || classes.info
}

const formatModelName = (model) => {
  if (!model) return ''
  const parts = model.split('\\')
  const modelName = parts[parts.length - 1]
  return modelName
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const formatDueDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(date)
  dueDate.setHours(0, 0, 0, 0)

  const diffTime = dueDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Due Today'
  if (diffDays === 1) return 'Due Tomorrow'
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
  if (diffDays <= 7) return `Due in ${diffDays} days`

  return date.toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  })
}

const getCompanyLogoUrl = (company) => {
  const companyId = company?.__id ?? getFieldValue(company, resolvedFieldMap.value.id, companyIdAliases)
  if (companyId == null) return null
  return props.companyLogos[companyId] || null
}

const resolvedCurrentCompanyLogo = computed(() => {
  if (props.currentCompanyLogo) return props.currentCompanyLogo
  const mappedLogo = getCompanyLogoUrl(normalizedCurrentCompany.value)
  if (mappedLogo) return mappedLogo
  if (props.companyLogo) return props.companyLogo
  return '/logo.png'
})

const updateDisplayedCompanyLogo = (logoSrc) => {
  const fallbackLogo = '/logo.png'
  const targetSrc = logoSrc || fallbackLogo

  if (targetSrc === fallbackLogo || typeof Image === 'undefined') {
    displayedCompanyLogoSrc.value = fallbackLogo
    return
  }

  const probe = new Image()
  probe.onload = () => {
    displayedCompanyLogoSrc.value = targetSrc
  }
  probe.onerror = () => {
    displayedCompanyLogoSrc.value = fallbackLogo
  }
  probe.src = targetSrc
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  checkMobile()
  window.addEventListener('resize', checkMobile)
  const activeMode = getMode() || resolvedThemeModes.value[0] || 'light'
  currentThemeMode.value = resolvedThemeModes.value.includes(activeMode) ? activeMode : resolvedThemeModes.value[0]
  updateDisplayedCompanyLogo(resolvedCurrentCompanyLogo.value)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', checkMobile)
})

watch(searchQuery, (newValue) => emit('search', newValue))
watch(resolvedCurrentCompanyLogo, (newLogo) => {
  updateDisplayedCompanyLogo(newLogo)
})
watch(resolvedUserAvatarUrl, () => {
  avatarLoadFailed.value = false
})
</script>

<template>
  <header :class="cn(
    'fixed top-0 z-50 w-full backdrop-blur-md transition-all duration-300 ease-out',
    props.themeScope === 'module' && 'kv-module-header',
    getHeaderClass()
  )" :style="{ left: '0' }">
    <div class="relative flex items-center justify-between h-20 sm:h-18 px-3 sm:px-4 md:px-6">
      <!-- Left side - Company & Page Info -->
      <div class="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
        <!-- Mobile Sidebar Toggle - Moved to far left -->
        <button v-if="isMobile"
          class="p-2 ui-text rounded-lg hover:bg-(--ui-surface-muted) transition-colors shrink-0"
          @click="emit('toggle-mobile-sidebar')">
          <Icon icon="bars" class="w-5 h-5" />
        </button>

        <!-- Logged-in Company Logo -->
        <div v-if="resolvedCurrentCompanyLogo"
          :class="cn('shrink-0 overflow-hidden rounded-2xl flex items-center justify-center', props.companyLogoClass)">
          <img :src="displayedCompanyLogoSrc" alt="Company logo"
            class="max-w-full max-h-full w-auto h-auto object-contain object-center">
        </div>

        <!-- Divider -->
        <div v-if="resolvedCurrentCompanyLogo && resolvedShowCompanyInfo && normalizedCurrentCompany"
          class="h-5 sm:h-18 w-px ui-border-strong-bg shrink-0 hidden sm:block" />

        <!-- Company Info Card - Simplified for mobile -->
        <div v-if="resolvedShowCompanyInfo && normalizedCurrentCompany"
          class="shrink-0 ui-surface border ui-border-strong px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl shadow-sm flex items-center gap-2 relative hover:bg-(--ui-surface-muted) transition-colors max-w-52 sm:max-w-72">
          <!-- Company Details with Switcher -->
          <button v-if="normalizedCompanies.length > 1"
            class="flex items-center gap-2 sm:gap-3 w-44 sm:w-60 cursor-pointer rounded-lg px-1.5 py-1 transition-all group"
            @click="toggleCompanyDropdown">
            <div
              class="w-8 h-8 rounded-lg ui-surface-muted border ui-border-strong flex items-center justify-center shrink-0">
              <Icon icon="building" class="w-4 h-4 ui-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="text-xs sm:text-sm font-semibold ui-text truncate group-hover:text-(--ui-primary) leading-tight">
                {{ normalizedCurrentCompany.__name }}
              </p>
            </div>
            <Icon icon="chevron-down"
              class="w-3.5 h-3.5 ui-text-soft shrink-0 group-hover:text-(--ui-primary) transition-transform"
              :class="{ 'rotate-180': showCompanyDropdown }" />
          </button>

          <!-- Static display when only one company -->
          <div v-else class="min-w-0 flex-1 px-1">
            <p class="text-xs sm:text-sm font-semibold ui-text truncate max-w-[160px] sm:max-w-52 leading-tight">
              {{ normalizedCurrentCompany.__name }}
            </p>
          </div>

          <!-- Company Dropdown - Same as before but positioned better -->
          <transition enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-200 ease-in" enter-from-class="opacity-0 translate-y-2 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100" leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-2 scale-95">
            <div v-if="showCompanyDropdown"
              class="ui-surface absolute top-full left-0 right-0 sm:left-0 sm:right-auto mt-2 w-[min(92vw,24rem)] rounded-2xl border ui-border-strong shadow-2xl z-50 max-h-96 overflow-hidden">
              <div class="p-3 sm:p-4 border-b ui-border-strong ui-surface-muted">
                <h3 class="text-sm sm:text-base font-semibold ui-text flex items-center gap-2">
                  <Icon icon="list" class="w-4 h-4 ui-primary" />
                  {{ resolvedSwitcherTitle }}
                </h3>
                <p class="text-xs ui-text mt-1">
                  {{ resolvedSwitcherDescription }}
                </p>
              </div>
              <div class="py-2 max-h-80 overflow-y-auto">
                <button v-for="company in normalizedCompanies" :key="company.__id || company.__name" :class="cn(
                  'mx-2 flex items-center w-[calc(100%-1rem)] rounded-xl px-3 sm:px-4 py-2.5 text-sm transition-all group border',
                  getCompanyRowClasses(company.__id === normalizedCurrentCompany?.__id)
                )" :style="getCompanyRowStyle(company.__id === normalizedCurrentCompany?.__id)"
                  @click="handleCompanyChange(company)">
                  <div v-if="getCompanyLogoUrl(company)" class="shrink-0 mr-2 sm:mr-3">
                    <img :src="getCompanyLogoUrl(company)" :alt="`${company.__name} ${entityLabelLower} logo`"
                      class="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-lg ui-surface p-0.5 sm:p-1 border ui-border-strong group-hover:border-(--ui-primary-soft) transition-colors"
                      @error="(e) => { e.target.src = '/logo.png' }">
                  </div>
                  <div v-else
                    class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-linear-to-br from-(--ui-bg) to-(--ui-bg) flex items-center justify-center mr-2 sm:mr-3 shrink-0">
                    <Icon icon="building" class="w-3.5 h-3.5 sm:w-4 sm:h-4 ui-text" />
                  </div>
                  <div class="flex-1 text-left min-w-0">
                    <p class="font-semibold truncate text-sm sm:text-md">
                      {{ company.__name }}
                    </p>
                  </div>
                  <Icon v-if="company.__id === normalizedCurrentCompany?.__id" icon="check-circle"
                    class="w-4 h-4 sm:w-5 sm:h-5 ui-primary shrink-0 ml-2"
                    :style="getCompanyCheckStyle(company.__id === normalizedCurrentCompany?.__id)" />
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <div v-if="showHeaderLogo && (logoUrl || headerLogo)"
        class="pointer-events-none absolute left-1/2 -translate-x-1/2">
        <img :src="logoUrl || headerLogo" alt="App logo" class="h-16 sm:h-32 md:h-32 mt-4 w-auto object-contain"
          @error="(e) => { e.target.src = '/applogo.png' }">
      </div>

      <!-- Right side - Actions -->
      <div class="flex items-center gap-1 sm:gap-2 md:gap-3 pl-2">
        <!-- Notifications -->
        <button v-if="showNotifications"
          class="relative p-2 ui-text rounded-xl hover:bg-(--ui-surface-muted) transition-colors"
          @click="toggleNotifications">
          <Icon icon="bell" class="w-5 h-5" />
          <span v-if="notificationCount > 0"
            class="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 min-w-4 h-4 sm:min-w-[18px] sm:h-[18px] ui-danger-bg ui-text-inverse text-[10px] sm:text-xs rounded-full flex items-center justify-center font-semibold px-0.5 sm:px-1">
            {{ notificationCount > 9 ? '9+' : notificationCount }}
          </span>
        </button>

        <!-- Notifications Dropdown - Mobile optimized -->
        <transition enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-300 ease-in" enter-from-class="opacity-0 translate-y-2 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100" leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 translate-y-2 scale-95">
          <div v-if="showNotificationsDropdown"
            class="ui-surface absolute right-2 sm:right-4 md:right-6 top-14 sm:top-16 mt-2 w-[calc(100vw-1rem)] max-w-sm sm:w-80 md:w-96 rounded-2xl border ui-border-strong shadow-2xl z-9999 overflow-hidden">
            <div class="p-3 sm:p-4 border-b ui-border-strong ui-surface-muted">
              <h3 class="text-sm sm:text-base font-semibold ui-text">
                {{ notificationsTitle }}
              </h3>
              <p v-if="notificationCount > 0" class="text-xs ui-text mt-1">
                You have {{ notificationCount }} unread notification{{ notificationCount > 1 ? 's' : '' }}
              </p>
            </div>

            <div class="max-h-[60vh] sm:max-h-96 overflow-y-auto">
              <div v-if="notifications.length === 0" class="p-6 sm:p-8 text-center">
                <Icon icon="bell" class="w-10 h-10 sm:w-12 sm:h-12 mx-auto ui-text mb-2" />
                <p class="text-md ui-text">
                  No notifications
                </p>
              </div>

              <div v-for="notification in notifications" v-else :key="notification.id" :class="[
                'p-3 sm:p-4 border-b ui-border-strong hover:bg-(--ui-surface-muted) cursor-pointer transition-colors',
                notification.read ? 'opacity-60' : ''
              ]" @click="handleNotificationClick(notification)">
                <div class="flex items-start space-x-2 sm:space-x-3">
                  <!-- Notification Type Icon -->
                  <div :class="[
                    'shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center',
                    getNotificationTypeClass(notification)
                  ]">
                    <Icon v-if="notification.title.includes('Overdue')" icon="exclamation-triangle"
                      class="w-4 h-4 sm:w-5 sm:h-5" />
                    <Icon v-else-if="notification.type === 'due_date_reminder'" icon="clock"
                      class="w-4 h-4 sm:w-5 sm:h-5" />
                    <Icon v-else icon="bell" class="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  <div class="flex-1 min-w-0">
                    <!-- Notification Title -->
                    <div class="flex items-start justify-between gap-2">
                      <p class="text-xs sm:text-md font-semibold ui-text flex-1 leading-tight">
                        {{ notification.title }}
                      </p>
                      <!-- Unread indicator -->
                      <div v-if="!notification.read" class="shrink-0 w-2 h-2 mt-1 ui-primary-bg rounded-full" />
                    </div>

                    <div v-if="notification.source" class="flex items-center gap-1 sm:gap-1.5 mt-1.5 flex-wrap">
                      <span
                        class="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold ui-accent-soft ui-accent border border-(--ui-accent-soft)">
                        <Icon icon="tag" class="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                        {{ notification.source.body_code }}
                      </span>
                      <Icon icon="chevron-right" class="w-2.5 h-2.5 sm:w-3 sm:h-3 ui-text hidden xs:block" />
                      <span
                        class="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ui-surface-muted ui-text border ui-border-strong">
                        {{ notification.source.code }}
                      </span>
                    </div>

                    <!-- Model & Due Date Badges -->
                    <div class="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
                      <span v-if="notification.model"
                        class="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ui-primary-soft ui-primary">
                        <Icon icon="file" class="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                        <span class="truncate max-w-[100px] sm:max-w-none">{{ formatModelName(notification.model)
                          }}</span>
                      </span>

                      <!-- Due Date Badge -->
                      <span v-if="notification.due_date" :class="[
                        'inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium whitespace-nowrap',
                        notification.title.includes('Overdue')
                          ? 'ui-danger-soft ui-danger border border-(--ui-danger-soft)'
                          : notification.title.includes('Due in 0')
                            ? 'ui-warning-soft ui-warning border border-(--ui-warning-soft)'
                            : 'ui-warning-soft ui-warning border border-(--ui-warning-soft)'
                      ]">
                        <Icon icon="calendar" class="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 shrink-0" />
                        {{ formatDueDate(notification.due_date) }}
                      </span>
                    </div>

                    <!-- Time -->
                    <p class="text-[10px] sm:text-xs ui-text mt-1.5 sm:mt-2 flex items-center">
                      <Icon icon="clock" class="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                      {{ notification.time }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="notifications.length > 0"
              class="p-2 sm:p-3 text-center border-t ui-border-strong ui-surface-muted">
              <button class="text-sm font-semibold ui-primary hover:text-(--ui-primary-strong) transition-colors"
                @click="handleViewAllNotifications">
                View all notifications →
              </button>
            </div>
          </div>
        </transition>

        <div v-if="showSearch" class="w-40 sm:w-52 md:w-64">
          <Search v-model="searchQuery" :placeholder="searchPlaceholder" size="sm" :show-no-results="false"
            :min-length="0" :debounce="200" :results="[]" />
        </div>

        <!-- Profile Dropdown -->
        <div class="relative">
          <button
            class="shrink-0 rounded-full transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ui-primary)"
            :aria-label="`${user.name} profile menu`" @click="toggleProfile">
            <div
              class="w-9 h-9 sm:w-10 sm:h-10 bg-linear-to-br from-(--ui-primary-soft) to-(--ui-accent-soft) rounded-full flex items-center justify-center shadow-sm overflow-hidden border ui-border-strong">
              <img v-if="showAvatarImage" :src="resolvedUserAvatarUrl" :alt="resolvedUserAvatarAlt"
                class="w-full h-full object-cover" @error="handleAvatarError">
              <span v-else class="ui-primary text-sm sm:text-base font-semibold">{{ userInitials }}</span>
            </div>
          </button>

          <!-- Dropdown - Mobile optimized -->
          <transition enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-200 ease-in" enter-from-class="opacity-0 translate-y-2 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100" leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-2 scale-95">
            <div v-if="showProfile"
              class="ui-surface absolute right-0 mt-2 w-56 sm:w-60 rounded-xl border ui-border-strong shadow-xl z-50 overflow-hidden">
              <div class="p-3 sm:p-4 border-b ui-border-strong flex items-center gap-3">
                <div
                  class="w-10 h-10 shrink-0 bg-linear-to-br from-(--ui-primary-soft) to-(--ui-accent-soft) rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                  <img v-if="showAvatarImage" :src="resolvedUserAvatarUrl" :alt="resolvedUserAvatarAlt"
                    class="w-full h-full object-cover" @error="handleAvatarError">
                  <span v-else class="ui-primary text-sm font-semibold">{{ userInitials }}</span>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold ui-text truncate">
                    {{ user.name }}
                  </p>
                  <p class="text-xs ui-text truncate">
                    {{ user.email }}
                  </p>
                </div>
              </div>
              <div v-if="showThemeSwitcher" class="px-3 py-3 border-b ui-border-strong">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2 min-w-0">
                    <Icon :icon="currentThemeMode === 'dark' ? 'moon' : 'sun'" class="w-4 h-4 shrink-0"
                      :class="currentThemeMode === 'dark' ? 'ui-primary' : 'ui-text'" />
                    <span class="text-sm font-medium ui-text truncate">
                      {{ themeSwitcherTitle }}
                    </span>
                  </div>
                  <Switch v-model="isDarkTheme" size="md" :disabled="!canToggleTheme" />
                </div>
              </div>
              <div class="py-2">
                <template v-for="item in profileMenuItems" :key="item.name">
                  <router-link v-if="item.route" :to="item.route" :class="cn(
                    'flex items-center px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                    getHeaderActiveItemClasses(isItemActive(item))
                  )" :style="getHeaderActiveItemStyle(isItemActive(item))" @click="handleNavigation(item)">
                    <!-- Active indicator bar -->
                    <div v-if="isItemActive(item)"
                      class="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 sm:h-8 bg-linear-to-b from-(--ui-primary) to-(--ui-primary) rounded-r-full"
                      :style="getHeaderActiveIndicatorStyle(isItemActive(item))" />
                    <div :class="cn(
                      'flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg mr-2 sm:mr-3 shrink-0 transition-colors ml-1 sm:ml-2',
                      getHeaderActiveIconClasses(isItemActive(item))
                    )" :style="getHeaderActiveIconStyle(isItemActive(item))">
                      <Icon v-if="item.icon" :icon="item.icon" class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span :class="cn(
                      'flex-1 truncate font-semibold text-xs sm:text-md',
                      getHeaderActiveTextClasses(isItemActive(item))
                    )" :style="getHeaderActiveTextStyle(isItemActive(item))">
                      {{ item.label }}
                    </span>
                  </router-link>
                  <button v-else
                    class="flex items-center w-full px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ui-text hover:bg-(--ui-surface-muted) hover:text-(--ui-text) border border-transparent"
                    @click="handleProfileAction(item)">
                    <div
                      class="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg mr-2 sm:mr-3 shrink-0 transition-colors ml-1 sm:ml-2 ui-surface-muted ui-text group-hover:bg-(--ui-bg)">
                      <Icon v-if="item.icon" :icon="item.icon" class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span class="flex-1 truncate font-semibold ui-text text-xs sm:text-md">
                      {{ item.label }}
                    </span>
                  </button>
                </template>
              </div>
              <div class="border-t ui-border-strong py-2">
                <button
                  class="flex items-center w-full px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ui-danger hover:bg-(--ui-danger-soft) border border-transparent"
                  @click="handleLogout">
                  <div
                    class="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg mr-1 sm:mr-1 shrink-0 transition-colors ml-1 sm:ml-2 ui-danger-soft ui-danger group-hover:bg-(--ui-danger-soft)">
                    <Icon icon="sign-out-alt" class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span class="truncate font-semibold ui-danger text-xs sm:text-md">
                    Sign out
                  </span>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.kv-module-header {
  background: color-mix(in oklab,
      var(--module-soft, var(--ui-primary-soft)) 62%,
      var(--ui-surface) 38%);
}
</style>