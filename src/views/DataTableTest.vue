<template>
  <div class="p-2">

    <DataTableToolBar
      :selected-items="selectedUsers"
      :total-items="filteredUsers.length"
      v-model:filter-rules="filterRules"
            :bulk-actions="bulkActions"
      :add-button="addButtonConfig"
      :density="density"
      :toggleable-columns="allColumns"
      :visible-columns="visibleColumns"
      :is-refreshing="isRefreshing"
      :show-density-toggle="true"
      :show-column-toggle="true"
      :show-refresh="true"
      :show-search="false"
      :enable-filters="true"
      :filter-fields="toolbarFilterFields"
      :search-query="searchQuery"
      search-placeholder="Search users..."
      @bulk-action="handleBulkAction"
      @update:density="handleDensityChange"
      @update:search-query="(value) => (searchQuery = value)"
      @toggle-column="handleColumnToggle"
      @refresh="handleRefresh"
      @add="handleAddUser"
      @add-button-click="handleAddButtonClick"
    >
      <template #actions>
        <!-- Additional toolbar actions -->
        <button
          :disabled="selectedUsers.length === 0"
          class="px-3 py-2 text-sm ui-text hover:text-(--ui-text) border ui-border-strong rounded-md hover:bg-(--ui-surface) flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleBulkExport"
        >
          <font-awesome-icon icon="download" />
          Export Selected
        </button>
      </template>
    </DataTableToolBar>


    <DataTable
      :data="filteredUsers"
      :columns="visibleColumnObjects"
      :selectable="true"
      :selected-items="selectedUsers"
      :striped="true"
      :hoverable="true"
      :clickable-rows="true"
      :page-size="pageSize"
      :show-pagination="true"
      :density="density"
      :highlight-unread-rows="true"
      unread-mode="new-only"
      unread-created-at-field="created_at"
      :actions="userActions"
      empty-text="No users found"
      @selection-change="selectedUsers = $event"
      @sort-change="handleSort"
      @row-click="handleRowClick"
      @action="handleAction"
    >
      <!-- Custom cell for user name with avatar -->
      <template #cell-name="{ item }">
        <div class="flex items-center">
          <img
            :src="item.avatar"
            :alt="item.name"
            class="w-8 h-8 rounded-full mr-3"
            @error="handleImageError"
          >
          <div>
            <div class="font-medium ui-text">
              {{ item.name }}
            </div>
            <div class="text-xs ui-text">
              ID: {{ item.id }}
            </div>
          </div>
        </div>
      </template>

      <!-- Custom cell for status -->
      <template #cell-status="{ value }">
        <span :class="getStatusBadgeClasses(value)">
          <span class="flex items-center gap-1">
            <span
              :class="[
                'w-2 h-2 rounded-full',
                value === 'active' ? 'ui-success-bg' : 'ui-danger-bg'
              ]"
            />
            {{ value }}
          </span>
        </span>
      </template>

      <!-- Custom cell for salary -->
      <template #cell-salary="{ value }">
        <span class="font-mono ui-success">
          {{ formatCurrency(value) }}
        </span>
      </template>

      <!-- Custom cell for last login -->
      <template #cell-lastLogin="{ value }">
        <span class="text-sm ui-text">
          {{ formatDate(value) }}
        </span>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DataTableToolBar from '../components/DataTableToolBar.vue'
import DataTable from '../components/DataTable.vue'

// Props
const props = defineProps({
  currentCompany: {
    type: Object,
    default: null
  }
})

// Simulated current user with permissions
const currentUser = ref({
  id: 1,
  role: 'admin', // Can be: admin, editor, viewer
  permissions: ['users.view', 'users.edit', 'users.delete', 'users.activate', 'users.create']
})

// Helper function to check permissions
const hasPermission = (permission) => {
  return currentUser.value.permissions.includes(permission)
}

// Define add button configuration with permission checks
const addButtonConfig = computed(() => ({
  label: 'Add User',
  icon: 'user-plus',
  permission: () => hasPermission('users.create'),
  onClick: () => handleAddUser()
}))

// Define actions with permission checks
const userActions = computed(() => [
  {
    key: 'view',
    icon: 'eye',
    variant: 'primary',
    tooltip: 'View user details',
    permission: () => hasPermission('users.view')
  },
  {
    key: 'edit',
    icon: 'pen',
    variant: 'secondary',
    tooltip: 'Edit user',
    permission: (item) => {
      // Check if user has edit permission
      if (!hasPermission('users.edit')) return false
      
      // Admins can edit anyone, others can't edit admins
      if (currentUser.value.role === 'admin') return true
      return item.role !== 'Admin'
    },
    disabled: (item) => {
      // Can't edit yourself
      return item.id === currentUser.value.id
    }
  },
  {
    key: 'delete',
    icon: 'trash',
    variant: 'danger',
    tooltip: 'Delete user',
    permission: (item) => {
      // Check if user has delete permission
      if (!hasPermission('users.delete')) return false
      
      // Can't delete admin users
      if (item.role === 'Admin') return false
      
      // Can't delete yourself
      if (item.id === currentUser.value.id) return false
      
      return true
    },
    visible: (item) => {
      // Hide delete button for admin role users
      return item.role !== 'Admin'
    }
  },
  {
    key: 'activate',
    icon: 'check',
    variant: 'success',
    tooltip: 'Activate user',
    visible: (item) => item.status === 'inactive',
    permission: () => hasPermission('users.activate')
  },
  {
    key: 'deactivate',
    icon: 'times',
    variant: 'warning',
    tooltip: 'Deactivate user test. blah',
    visible: (item) => item.status === 'active',
    permission: () => hasPermission('users.activate'),
    disabled: (item) => item.id === currentUser.value.id
  }
])

// Sample data with better avatars and company field
const users = ref([
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    department: 'Engineering',
    status: 'active',
    lastLogin: new Date('2024-01-15'),
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format',
    salary: 75000,
    joinDate: '2023-03-15',
    created_at: '2023-03-15T09:00:00.000Z',
    company_id: 1
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Editor',
    department: 'Marketing',
    status: 'active',
    lastLogin: new Date('2024-01-14'),
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c3c7?w=32&h=32&fit=crop&crop=face&auto=format',
    salary: 65000,
    joinDate: '2023-05-22',
    created_at: '2023-05-22T09:00:00.000Z',
    company_id: 1
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'Viewer',
    department: 'Sales',
    status: 'inactive',
    lastLogin: new Date('2024-01-10'),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face&auto=format',
    salary: 55000,
    joinDate: '2023-07-08',
    created_at: '2023-07-08T09:00:00.000Z',
    company_id: 2
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    role: 'Editor',
    department: 'Design',
    status: 'active',
    lastLogin: new Date('2024-01-16'),
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face&auto=format',
    salary: 70000,
    joinDate: '2023-02-14',
    created_at: '2023-02-14T09:00:00.000Z',
    company_id: 2
  },
  {
    id: 5,
    name: 'Alex Chen',
    email: 'alex@example.com',
    role: 'Admin',
    department: 'Engineering',
    status: 'active',
    lastLogin: new Date('2024-01-17'),
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face&auto=format',
    salary: 80000,
    joinDate: '2023-01-10',
    created_at: '2023-01-10T09:00:00.000Z',
    company_id: 1
  },
  {
    id: 6,
    name: 'Maria Garcia',
    email: 'maria@example.com',
    role: 'Editor',
    department: 'Marketing',
    status: 'inactive',
    lastLogin: new Date('2024-01-05'),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face&auto=format',
    salary: 62000,
    joinDate: '2023-06-20',
    created_at: '2023-06-20T09:00:00.000Z',
    company_id: 2
  }
])

// Filter state
const searchQuery = ref('')
const selectedStatus = ref('')
const departmentFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const filterRules = ref({ logic: 'all', rules: [] })

// Table state
const selectedUsers = ref([])
const pageSize = ref(10)
const density = ref('compact')
const isRefreshing = ref(false)

// Status messages
const statusMessage = ref('')
const statusMessageClass = ref('')

// Column configuration
const allColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'department', label: 'Department', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'lastLogin', label: 'Last Login', sortable: true },
  { key: 'salary', label: 'Salary', sortable: true }
]

const visibleColumns = ref(['name', 'email', 'role', 'department', 'status', 'salary'])

// Computed property to get actual column objects for visible columns
const visibleColumnObjects = computed(() =>
  allColumns.filter(col => visibleColumns.value.includes(col.key))
)

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
]

const selectFilterDefs = ref([
  { key: 'status', label: 'Status', options: statusOptions, value: '' },
  { key: 'role', label: 'Role', options: [{ value: 'Admin', label: 'Admin' }, { value: 'Editor', label: 'Editor' }, { value: 'Viewer', label: 'Viewer' }], value: '' },
  { key: 'department', label: 'Department', options: [{ value: 'Engineering', label: 'Engineering' }, { value: 'Marketing', label: 'Marketing' }, { value: 'Sales', label: 'Sales' }, { value: 'Design', label: 'Design' }], value: '' }
])
const dateFilterDefs = ref([{ key: 'joinDate', label: 'Join Date', from: '', to: '' }])
const numberFilterDefs = ref([{ key: 'salary', label: 'Salary', min: '', max: '', step: 1000 }])
const multiSelectFilterDefs = ref([{ key: 'departmentList', label: 'Departments', options: [{ value: 'Engineering', label: 'Engineering' }, { value: 'Marketing', label: 'Marketing' }, { value: 'Sales', label: 'Sales' }, { value: 'Design', label: 'Design' }], selected: [] }])
const toolbarFilterFields = computed(() => ([
  ...selectFilterDefs.value.map(f => ({ key: f.key, label: f.label, type: 'select', options: f.options || [] })),
  {
    key: 'name',
    label: 'Users',
    type: 'multiselect',
    options: users.value.map((u) => ({ value: u.name, label: u.name }))
  },
  ...dateFilterDefs.value.map(f => ({ key: f.key, label: f.label, type: 'date', options: f.options || [] })),
  ...numberFilterDefs.value.map(f => ({ key: f.key, label: f.label, type: 'number', options: f.options || [] })),
  ...multiSelectFilterDefs.value.map(f => ({ key: f.key, label: f.label, type: 'multi', options: f.options || [] })),
]))

const evaluateRule = (user, rule) => {
  const fieldValue = user[rule.field]
  const op = rule.operator
  const value = rule.value
  if (op === 'equals') return String(fieldValue) === String(value)
  if (op === 'not_equals') return String(fieldValue) !== String(value)
  if (op === 'gte') return Number(fieldValue) >= Number(value)
  if (op === 'lte') return Number(fieldValue) <= Number(value)
  if (op === 'between') {
    if (rule.type === 'date') {
      const d = new Date(fieldValue)
      const from = value?.from ? new Date(value.from) : null
      const to = value?.to ? new Date(value.to) : null
      if (from && to) return d >= from && d <= to
      if (from) return d >= from
      if (to) return d <= to
      return true
    }
    const n = Number(fieldValue)
    const from = value?.from !== '' ? Number(value?.from) : null
    const to = value?.to !== '' ? Number(value?.to) : null
    if (from !== null && to !== null) return n >= from && n <= to
    if (from !== null) return n >= from
    if (to !== null) return n <= to
    return true
  }
  if (op === 'includes_any' || op === 'includes_all') {
    const arr = Array.isArray(fieldValue) ? fieldValue : [fieldValue]
    const vals = Array.isArray(value) ? value : [value]
    if (op === 'includes_all') return vals.every(v => arr.map(String).includes(String(v)))
    return vals.some(v => arr.map(String).includes(String(v)))
  }
  if (op === 'in') {
    const vals = Array.isArray(value) ? value.map(String) : [String(value)]
    return vals.includes(String(fieldValue))
  }
  return true
}

// Updated bulk actions with proper structure
const bulkActions = [
  {
    key: 'activate',
    label: 'Activate Users',
    variant: 'primary',
    icon: ['fas', 'check']
  },
  {
    key: 'deactivate',
    label: 'Deactivate Users',
    variant: 'secondary',
    icon: ['fas', 'times']
  },
  {
    key: 'delete',
    label: 'Delete Users',
    variant: 'danger',
    icon: ['fas', 'trash']
  }
]

// Computed filtered data
const filteredUsers = computed(() => {
  let filtered = users.value

  // Apply company filter only when a company is provided
  const activeCompanyId = props.currentCompany?.company_id ?? props.currentCompany?.id
  if (activeCompanyId) {
    filtered = filtered.filter(user => user.company_id === Number(activeCompanyId))
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      user.department.toLowerCase().includes(query)
    )
  }

  // Apply status filter
  if (selectedStatus.value) {
    filtered = filtered.filter(user => user.status === selectedStatus.value)
  }

  // Apply department filter
  if (departmentFilter.value) {
    filtered = filtered.filter(user => user.department === departmentFilter.value)
  }

  // Apply date range filter (based on join date)
  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(user => {
      const joinDate = new Date(user.joinDate)
      const from = dateFrom.value ? new Date(dateFrom.value) : null
      const to = dateTo.value ? new Date(dateTo.value) : null

      if (from && to) {
        return joinDate >= from && joinDate <= to
      } else if (from) {
        return joinDate >= from
      } else if (to) {
        return joinDate <= to
      }
      return true
    })
  }

  const rules = filterRules.value?.rules || []
  if (rules.length > 0) {
    const isAll = (filterRules.value?.logic || 'all') === 'all'
    filtered = filtered.filter(user => {
      const checks = rules.map(rule => evaluateRule(user, rule))
      return isAll ? checks.every(Boolean) : checks.some(Boolean)
    })
  }

  return filtered
})

// Helper functions
const showStatusMessage = (message, type = 'success') => {
  statusMessage.value = message
  statusMessageClass.value = type === 'success'
    ? 'ui-success-soft ui-success border border-(--ui-success-soft)'
    : 'ui-danger-soft ui-danger border border-(--ui-danger-soft)'

  setTimeout(() => {
    statusMessage.value = ''
  }, 3000)
}

const getStatusBadgeClasses = (status) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full'

  switch (status) {
    case 'active':
      return `${baseClasses} ui-success-soft ui-success`
    case 'inactive':
      return `${baseClasses} ui-danger-soft ui-danger`
    default:
      return `${baseClasses} ui-surface-muted ui-text`
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

const handleImageError = (event) => {
  // Fallback to a placeholder when image fails to load
  event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent('User')}&background=e2e8f0&color=64748b&size=32`
}

// Event handlers
const handleSort = (sortInfo) => {
  console.log('Sort changed:', sortInfo)
  showStatusMessage(`Sorted by ${sortInfo.column} ${sortInfo.direction}`)
}

const handleRowClick = (rowInfo) => {
  console.log('Row clicked:', rowInfo)
  showStatusMessage(`Clicked on ${rowInfo.item.name}`)
}

// Handle add button click
const handleAddButtonClick = (buttonConfig) => {
  console.log('Add button clicked:', buttonConfig)
  // The onClick handler in the config will also be called
}

const handleAddUser = () => {
  const nextId = users.value.length > 0 ? Math.max(...users.value.map(u => u.id)) + 1 : 1
  const activeCompanyId = props.currentCompany?.company_id ?? props.currentCompany?.id
  const companyId = activeCompanyId ? Number(activeCompanyId) : 1

  const newUser = {
    id: nextId,
    name: `Test User ${nextId}`,
    email: `test.user.${nextId}@example.com`,
    role: 'Viewer',
    department: 'Engineering',
    status: 'active',
    lastLogin: new Date(),
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(`Test User ${nextId}`)}&background=e2e8f0&color=334155&size=32`,
    salary: 50000 + (nextId * 500),
    joinDate: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
    company_id: companyId
  }

  users.value.unshift(newUser)
  showStatusMessage(`Added ${newUser.name}`)
}

const handleBulkAction = (actionInfo) => {
  console.log('Bulk action:', actionInfo)
  const { action, items } = actionInfo

  switch (action) {
    case 'activate':
      items.forEach(user => {
        const index = users.value.findIndex(u => u.id === user.id)
        if (index !== -1) {
          users.value[index].status = 'active'
        }
      })
      showStatusMessage(`Activated ${items.length} users`)
      selectedUsers.value = []
      break

    case 'deactivate':
      items.forEach(user => {
        const index = users.value.findIndex(u => u.id === user.id)
        if (index !== -1) {
          users.value[index].status = 'inactive'
        }
      })
      showStatusMessage(`Deactivated ${items.length} users`)
      selectedUsers.value = []
      break

    case 'delete':
      if (confirm(`Are you sure you want to delete ${items.length} users?`)) {
        const idsToDelete = items.map(user => user.id)
        users.value = users.value.filter(user => !idsToDelete.includes(user.id))
        showStatusMessage(`Deleted ${items.length} users`)
        selectedUsers.value = []
      }
      break

    default:
      showStatusMessage(`Performed ${action} on ${items.length} users`)
  }
}

const handleDensityChange = (newDensity) => {
  density.value = newDensity
  showStatusMessage(`Changed density to ${newDensity}`)
}

// Fixed column toggle handler
const handleColumnToggle = (columnInfo) => {
  const { column, visible } = columnInfo
  
  if (visible) {
    // Add column if not already visible
    if (!visibleColumns.value.includes(column)) {
      visibleColumns.value.push(column)
      showStatusMessage(`Showed column: ${allColumns.find(c => c.key === column)?.label}`)
    }
  } else {
    // Remove column
    visibleColumns.value = visibleColumns.value.filter(key => key !== column)
    showStatusMessage(`Hidden column: ${allColumns.find(c => c.key === column)?.label}`)
  }
}

const handleRefresh = () => {
  isRefreshing.value = true
  showStatusMessage('Refreshing data...')

  // Simulate API call
  setTimeout(() => {
    isRefreshing.value = false
    showStatusMessage('Data refreshed successfully!')
  }, 2000)
}

const handleBulkExport = () => {
  if (selectedUsers.value.length === 0) return

  console.log('Bulk export selected users:', selectedUsers.value)
  showStatusMessage(`Exporting ${selectedUsers.value.length} selected users...`)
}

// Handle actions from the actions prop
const handleAction = ({ action, item }) => {
  console.log('Action triggered:', action, item)
  
  switch (action) {
    case 'view':
      viewUser(item)
      break
    case 'edit':
      editUser(item)
      break
    case 'delete':
      deleteUser(item)
      break
    case 'activate':
      activateUser(item)
      break
    case 'deactivate':
      deactivateUser(item)
      break
    default:
      console.warn('Unknown action:', action)
  }
}

const viewUser = (user) => {
  console.log('View user:', user)
  showStatusMessage(`Viewing details for ${user.name}`)
}

const editUser = (user) => {
  console.log('Edit user:', user)
  showStatusMessage(`Editing ${user.name}`)
}

const deleteUser = (user) => {
  console.log('Delete user:', user)
  if (confirm(`Are you sure you want to delete ${user.name}?`)) {
    const index = users.value.findIndex(u => u.id === user.id)
    if (index > -1) {
      users.value.splice(index, 1)
      showStatusMessage(`Deleted ${user.name}`)
      // Remove from selection if selected
      selectedUsers.value = selectedUsers.value.filter(u => u.id !== user.id)
    }
  }
}

const activateUser = (user) => {
  console.log('Activate user:', user)
  const index = users.value.findIndex(u => u.id === user.id)
  if (index !== -1) {
    users.value[index].status = 'active'
    showStatusMessage(`Activated ${user.name}`)
  }
}

const deactivateUser = (user) => {
  console.log('Deactivate user:', user)
  const index = users.value.findIndex(u => u.id === user.id)
  if (index !== -1) {
    users.value[index].status = 'inactive'
    showStatusMessage(`Deactivated ${user.name}`)
  }
}
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
