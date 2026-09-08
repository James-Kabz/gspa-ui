# DataTable Actions with Modal Integration

This guide shows how to integrate DataTable actions with modals for edit and delete operations, based on your compliance management use case.

## Complete Example

```vue
<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  Badge,
  DataTable,
  DataTableFilters,
  DataTableToolBar,
  ReusableFormModal,
} from '@gspa/ui'
import { useAuth } from '@/composables/useAuth'
import { useComplianceStore } from '@/stores/compliance/compliance'

const compliances = ref([])
const searchQuery = ref('')
const complianceStore = useComplianceStore()
const selectedCompliances = ref([])
const authStore = useAuth()
const selectedFormData = ref(null)

// Modal state management
const modals = ref({
  form: { show: false, type: 'create' },
  delete: { show: false },
})

// Define add button configuration with permission checks
const addButtonConfig = computed(() => ({
  label: 'Add Compliance',
  icon: 'plus',
  variant: 'success',
  size: 'lg',
  tooltip: 'Create new compliance',
  permission: () => authStore.hasPermission('create.compliance'),
  onClick: () => handleCreate()
}))

// Define table actions with permission checks
const tableActions = computed(() => [
  {
    key: 'edit',
    icon: 'pen',
    variant: 'primary',
    tooltip: 'Edit compliance',
    permission: () => authStore.hasPermission('update.compliance')
  },
  {
    key: 'delete',
    icon: 'trash',
    variant: 'danger',
    tooltip: 'Delete compliance',
    permission: () => authStore.hasPermission('delete.compliance')
  },
])

const allColumns = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'is_completed', label: 'Completed', sortable: true },
  { key: 'company.company_name', label: 'Company', sortable: true },
  { key: 'owner.name', label: 'Owner', sortable: true },
  { key: 'description', label: 'Description', sortable: true },
  { key: 'due_date', label: 'Due Date', sortable: true },
  { key: 'completed_at', label: 'Completed At', sortable: true },
]

const visibleColumns = ref([
  'title',
  'is_completed',
  'company.company_name',
  'owner.name',
  'description',
  'due_date',
  'completed_at',
])

const visibleColumnObjects = computed(() =>
  allColumns.filter((col) => visibleColumns.value.includes(col.key)),
)

const filteredCompliances = computed(() => {
  let filtered = compliances.value

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (compliance) =>
        compliance.title.toLowerCase().includes(query) ||
        compliance.description.toLowerCase().includes(query) ||
        (compliance.owner && compliance.owner.name.toLowerCase().includes(query)) ||
        (compliance.company &&
          compliance.company.company_name.toLowerCase().includes(query)),
    )
  }

  return filtered
})

// Modal management functions
const openModal = (type, compliance = null) => {
  selectedFormData.value = compliance

  // Close all modals first
  Object.keys(modals.value).forEach((key) => {
    modals.value[key].show = false
  })

  // Open the requested modal
  switch (type) {
    case 'create':
      modals.value.form.show = true
      modals.value.form.type = 'create'
      selectedFormData.value = {}
      break
    case 'edit':
      modals.value.form.show = true
      modals.value.form.type = 'edit'
      break
    case 'delete':
      modals.value.delete.show = true
      break
  }
}

const closeModal = () => {
  Object.keys(modals.value).forEach((key) => {
    modals.value[key].show = false
  })
  selectedFormData.value = null
}

// Handle DataTable action events
const handleTableAction = ({ action, item }) => {
  console.log('Action triggered:', action, item)
  
  switch (action) {
    case 'edit':
      openModal('edit', item)
      break
    case 'delete':
      openModal('delete', item)
      break
    default:
      console.warn('Unknown action:', action)
  }
}

// Handle add button click
const handleAddButtonClick = (buttonConfig) => {
  console.log('Add button clicked:', buttonConfig)
  // The onClick handler in the config will also be called
}

// Handle create button click
const handleCreate = () => {
  openModal('create')
}

// Handle form submission
const handleFormSubmit = async ({ formData, modalType, originalData }) => {
  let result

  if (modalType === 'create') {
    result = await complianceStore.createCompliance(formData)
  } else if (modalType === 'edit') {
    result = await complianceStore.updateCompliance(originalData.id, formData)
  }

  if (result.success) {
    await complianceStore.initializeData()
    compliances.value = complianceStore.compliance
    closeModal()
  }
}

// Handle delete confirmation
const handleConfirmDelete = async ({ id }) => {
  const result = await complianceStore.deleteCompliance(id)

  if (result.success) {
    compliances.value = complianceStore.compliance
    closeModal()
  }
}

onMounted(async () => {
  const result = await complianceStore.initializeData()
  if (result.success) {
    compliances.value = complianceStore.compliance
  }
})
</script>

<template>
  <div class="space-y-4">
    <!-- Filters -->
    <DataTableFilters
      v-model:searchQuery="searchQuery"
      searchPlaceholder="Search compliances..."
      :show-add="true"
      :total-items="filteredCompliances.length"
      item-label="compliances"
      :add-button="addButtonConfig"
      @add-button-click="handleAddButtonClick"
    />

    <!-- Toolbar -->
    <DataTableToolBar
      :toggleable-columns="allColumns"
      :visible-columns="visibleColumns"
      :show-density-toggle="false"
      :show-refresh="false"
      :show-column-toggle="true"
      @toggle-column="handleColumnToggle"
    />

    <!-- DataTable with Actions -->
    <DataTable
      :data="filteredCompliances"
      :columns="visibleColumnObjects"
      :selected-items="selectedCompliances"
      :data-loading="complianceStore.loading"
      :actions="tableActions"
      :striped="true"
      :hoverable="true"
      :clickable-rows="true"
      :page-size="10"
      :show-pagination="true"
      empty-text="No Compliances found"
      @selection-change="selectedCompliances = $event"
      @action="handleTableAction"
    >
      <!-- Custom cell templates -->
      <template #cell-due_date="{ item }">
        {{ new Date(item.due_date).toLocaleDateString() }}
      </template>

      <template #cell-completed_at="{ item }">
        {{ new Date(item.completed_at).toLocaleDateString() }}
      </template>

      <template #cell-description="{ item }">
        <span class="truncate max-w-xs block" :title="item.description">
          {{
            item.description.length > 50
              ? item.description.slice(0, 50) + '...'
              : item.description
          }}
        </span>
      </template>

      <template #cell-is_completed="{ item }">
        <Badge :variant="item.is_completed ? 'success' : 'warning'">
          {{ item.is_completed ? 'Completed' : 'Pending' }}
        </Badge>
      </template>
    </DataTable>

    <!-- Form Modal (Create/Edit) -->
    <ReusableFormModal
      v-model="modals.form.show"
      :modal-type="modals.form.type"
      :fields="formFields"
      entity-name="Compliance"
      :initial-data="selectedFormData"
      :loading="complianceStore.isLoading"
      @submit="handleFormSubmit"
      @close="closeModal"
    />

    <!-- Delete Confirmation Modal -->
    <Modal
      v-model="modals.delete.show"
      title="Delete Compliance"
      @close="closeModal"
    >
      <p>Are you sure you want to delete this compliance?</p>
      <p class="font-semibold mt-2">{{ selectedFormData?.title }}</p>
      
      <template #footer>
        <Button variant="outline" @click="closeModal">
          Cancel
        </Button>
        <Button
          variant="danger"
          :loading="complianceStore.isLoading"
          @click="handleConfirmDelete(selectedFormData)"
        >
          Delete
        </Button>
      </template>
    </Modal>
  </div>
</template>
```

## Key Points

### 1. **Action Handler**

The `@action` event handler receives an object with:
- `action`: The action key ('edit', 'delete', etc.)
- `item`: The row data
- `actionConfig`: The full action configuration

```javascript
const handleTableAction = ({ action, item }) => {
  switch (action) {
    case 'edit':
      openModal('edit', item)
      break
    case 'delete':
      openModal('delete', item)
      break
  }
}
```

### 2. **Modal State Management**

Use a centralized modal state object:

```javascript
const modals = ref({
  form: { show: false, type: 'create' },
  delete: { show: false },
})

const openModal = (type, data = null) => {
  selectedFormData.value = data
  
  // Close all modals
  Object.keys(modals.value).forEach((key) => {
    modals.value[key].show = false
  })
  
  // Open specific modal
  modals.value[type].show = true
}
```

### 3. **Permission Integration**

Actions automatically check permissions before rendering:

```javascript
const tableActions = computed(() => [
  {
    key: 'edit',
    icon: 'pen',
    variant: 'primary',
    tooltip: 'Edit compliance',
    permission: () => authStore.hasPermission('update.compliance')
  },
  {
    key: 'delete',
    icon: 'trash',
    variant: 'danger',
    tooltip: 'Delete compliance',
    permission: () => authStore.hasPermission('delete.compliance')
  },
])
```

### 4. **Conditional Actions**

You can also make actions conditional based on item state:

```javascript
const tableActions = computed(() => [
  {
    key: 'complete',
    icon: 'check',
    variant: 'success',
    tooltip: 'Mark as complete',
    visible: (item) => !item.is_completed,
    permission: () => authStore.hasPermission('update.compliance')
  },
  {
    key: 'reopen',
    icon: 'undo',
    variant: 'warning',
    tooltip: 'Reopen compliance',
    visible: (item) => item.is_completed,
    permission: () => authStore.hasPermission('update.compliance')
  },
])
```

## Alternative: Using onClick Handler

You can also handle actions directly in the action configuration:

```javascript
const tableActions = computed(() => [
  {
    key: 'edit',
    icon: 'pen',
    variant: 'primary',
    tooltip: 'Edit compliance',
    permission: () => authStore.hasPermission('update.compliance'),
    onClick: (item) => openModal('edit', item)
  },
  {
    key: 'delete',
    icon: 'trash',
    variant: 'danger',
    tooltip: 'Delete compliance',
    permission: () => authStore.hasPermission('delete.compliance'),
    onClick: (item) => openModal('delete', item)
  },
])
```

Then you don't need the `@action` handler on the DataTable component.

## Best Practices

1. **Centralize Modal State**: Use a single object to manage all modal states
2. **Close Before Open**: Always close all modals before opening a new one
3. **Pass Item Data**: Store the selected item data when opening modals
4. **Clear on Close**: Clear selected data when closing modals
5. **Use Computed for Actions**: Make actions reactive to permission changes
6. **Handle Loading States**: Show loading indicators during async operations
7. **Refresh Data**: Reload table data after successful create/update/delete operations

## Complete Flow

1. User clicks action button (edit/delete) in table row
2. `@action` event fires with action key and item data
3. `handleTableAction` routes to appropriate modal opener
4. Modal opens with pre-filled data (for edit) or confirmation (for delete)
5. User submits form or confirms deletion
6. API call is made to backend
7. On success, data is refreshed and modal closes
8. Table updates with new data

This pattern provides a clean, maintainable way to handle CRUD operations with permission checks in your DataTable components.
