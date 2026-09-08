<script setup>
import { computed, ref } from 'vue'
import Badge from '../../components/Badge.vue'
import Button from '../../components/Button.vue'
import DataTable from '../../components/DataTable.vue'
import DataTableFilters from '../../components/DataTableFilters.vue'
import DataTableToolBar from '../../components/DataTableToolBar.vue'
import ReusableFormModal from '../../components/ReusableFormModal.vue'
import DashboardShell from './DashboardShell.vue'

const searchQuery = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const selectedStatus = ref('')
const selectedUsers = ref([])
const density = ref('normal')
const showAddUserModal = ref(false)

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Pending', value: 'pending' }
]

const addButtonConfig = {
  label: 'Add User',
  variant: 'success',
  icon: 'plus',
  size: 'md',
  tooltip: 'Create a new user'
}

const columns = [
  { key: 'name', label: 'User' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'lastLogin', label: 'Last Login' }
]

const visibleColumnKeys = ref(columns.map((column) => column.key))
const visibleColumns = computed(() =>
  columns.filter((column) => visibleColumnKeys.value.includes(column.key))
)

const allUsers = ref([
  { id: 1, name: 'Ari Lopez', role: 'Admin', status: 'active', lastLogin: '2 hours ago' },
  { id: 2, name: 'Bianca Shaw', role: 'Manager', status: 'active', lastLogin: 'Yesterday' },
  { id: 3, name: 'Chris Mills', role: 'Analyst', status: 'pending', lastLogin: '2 days ago' },
  { id: 4, name: 'Dani Hill', role: 'Reviewer', status: 'paused', lastLogin: '3 days ago' },
  { id: 5, name: 'Emil Cruz', role: 'Analyst', status: 'active', lastLogin: '4 days ago' }
])

const filteredUsers = computed(() => {
  return allUsers.value.filter((user) => {
    const matchSearch = !searchQuery.value || user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchStatus = !selectedStatus.value || user.status === selectedStatus.value
    return matchSearch && matchStatus
  })
})

const bulkActions = [
  { key: 'message', label: 'Message', icon: 'message', variant: 'primary' },
  { key: 'pause', label: 'Pause', icon: 'pause', variant: 'warning' },
  { key: 'remove', label: 'Remove', icon: 'trash', variant: 'danger' }
]

const statusVariant = (status) => {
  const map = {
    active: 'success',
    paused: 'warning',
    pending: 'secondary'
  }
  return map[status] || 'secondary'
}

const handleToggleColumn = ({ column, visible }) => {
  if (visible) {
    if (!visibleColumnKeys.value.includes(column)) {
      visibleColumnKeys.value = [...visibleColumnKeys.value, column]
    }
  } else {
    visibleColumnKeys.value = visibleColumnKeys.value.filter((key) => key !== column)
  }
}

const userFormFields = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    required: true,
    placeholder: 'Jordan Blake',
    wrapperClass: 'col-span-12 md:col-span-6'
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    placeholder: 'jordan@company.com',
    wrapperClass: 'col-span-12 md:col-span-6'
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    required: true,
    placeholder: 'Select role',
    options: [
      { label: 'Admin', value: 'Admin' },
      { label: 'Manager', value: 'Manager' },
      { label: 'Analyst', value: 'Analyst' },
      { label: 'Reviewer', value: 'Reviewer' }
    ],
    wrapperClass: 'col-span-12 md:col-span-6'
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: statusOptions,
    wrapperClass: 'col-span-12 md:col-span-6'
  }
]

const handleAddUser = ({ formData }) => {
  const payload = formData instanceof FormData
    ? Object.fromEntries(formData.entries())
    : formData

  if (!payload?.name || !payload?.email || !payload?.role) {
    return
  }

  allUsers.value = [
    ...allUsers.value,
    {
      id: allUsers.value.length + 1,
      name: payload.name,
      role: payload.role,
      status: payload.status || 'active',
      lastLogin: 'Just now'
    }
  ]

  showAddUserModal.value = false
}
</script>

<template>
  <DashboardShell current-page="Users">
    <div class="space-y-6 ui-bg">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold ui-text">
            User Directory
          </h1>
          <p class="ui-text mt-1">
            Track active users, permissions, and last activity.
          </p>
        </div>
        <Button variant="primary">
          Invite Team
        </Button>
      </div>

      <div class="ui-bg rounded-xl shadow-sm border ui-border-strong overflow-hidden">
        <DataTableFilters
          v-model:search-query="searchQuery"
          v-model:date-from="dateFrom"
          v-model:date-to="dateTo"
          v-model:selected-status="selectedStatus"
          :status-options="statusOptions"
          :show-file-upload="false"
          :show-date-filter="false"
          :show-export="true"
          :show-add="true"
          :show-search="false"
          :add-button="addButtonConfig"
          search-placeholder="Search users"
          @export="() => {}"
          @add="showAddUserModal = true"
        />

        <DataTableToolBar
          :selected-items="selectedUsers"
          :total-items="filteredUsers.length"
          item-label="users found"
          :bulk-actions="bulkActions"
          :density="density"
          :toggleable-columns="columns"
          :visible-columns="visibleColumnKeys"
          :show-density-toggle="true"
          :show-column-toggle="false"
          :show-refresh="false"
          :show-search="true"
          :search-query="searchQuery"
          search-placeholder="Search users"
          :show-table-info="true"
          @update:density="(value) => (density = value)"
          @update:search-query="(value) => (searchQuery = value)"
          @toggle-column="handleToggleColumn"
        />

        <DataTable
          :data="filteredUsers"
          :columns="visibleColumns"
          :selectable="true"
          :selected-items="selectedUsers"
          :density="density"
          :page-size="5"
          :show-pagination="true"
          striped
          @selection-change="(items) => (selectedUsers = items)"
        >
          <template #cell-status="{ value }">
            <Badge
              :variant="statusVariant(value)"
              size="sm"
            >
              {{ value }}
            </Badge>
          </template>
        </DataTable>
      </div>
    </div>

    <ReusableFormModal
      v-model="showAddUserModal"
      modal-type="create"
      entity-name="User"
      :fields="userFormFields"
      :initial-data="{ status: 'active' }"
      modal-size="3xl"
      @submit="handleAddUser"
      @close="showAddUserModal = false"
    />
  </DashboardShell>
</template>
