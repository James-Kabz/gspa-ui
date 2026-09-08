<script setup>
import { computed, ref, watch, useSlots } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'
import Checkbox from './Checkbox.vue'
import DataTableHeader from './DataTableHeader.vue'
import DataTableRow from './DataTableRow.vue'
import DataTableToolBar from './DataTableToolBar.vue'
import DataTablePagination from './DataTablePagination.vue'
import FilterDrawer from './FilterDrawer.vue'
import Icon from './Icon.vue'
import Loader from './Loader.vue'
import Button from './Button.vue'
import Tooltip from './Tooltip.vue'
import Modal from './Modal.vue'

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  selectable: {
    type: Boolean,
    default: false
  },
  selectedItems: {
    type: Array,
    default: () => []
  },
  sortBy: {
    type: String,
    default: null
  },
  sortOrder: {
    type: String,
    default: 'asc',
    validator: (value) => ['asc', 'desc'].includes(value)
  },
  pageSize: {
    type: Number,
    default: 10
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  striped: {
    type: Boolean,
    default: true
  },
  hoverable: {
    type: Boolean,
    default: true
  },
  clickableRows: {
    type: Boolean,
    default: false
  },
  highlightUnreadRows: {
    type: Boolean,
    default: true
  },
  unreadCreatedAtField: {
    type: String,
    default: ''
  },
  unreadMode: {
    type: String,
    default: 'all',
    validator: (value) => ['all', 'new-only'].includes(value)
  },
  unreadPersistKey: {
    type: String,
    default: ''
  },
  emptyText: {
    type: String,
    default: 'No data available'
  },
  emptySubtitle: {
    type: String,
    default: 'Try adjusting your search or filter criteria'
  },
  rowKey: {
    type: String,
    default: 'id'
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'bordered', 'minimal'].includes(value)
  },
  density: {
    type: String,
    default: 'compact',
    validator: (value) => ['compact', 'normal', 'comfortable'].includes(value)
  },
  headerVariant: {
    type: String,
    default: 'default'
  },
  headerPadding: {
    type: String,
    default: 'normal'
  },
  paginationVariant: {
    type: String,
    default: 'default'
  },
  paginationPadding: {
    type: String,
    default: 'normal'
  },
  // Actions configuration
  actions: {
    type: Array,
    default: () => []
    // Expected format:
    // [
    //   {
    //     key: 'edit',
    //     label: 'Edit',
    //     icon: 'pen',
    //     variant: 'primary', // primary, secondary, danger, success, warning
    //     permission: (item) => true, // Function to check permission
    //     visible: (item) => true, // Function to check visibility
    //     disabled: (item) => false, // Function to check if disabled
    //     tooltip: 'Edit item',
    //     onClick: (item) => {} // Optional handler
    //   }
    // ]
  },
  showActionsColumn: {
    type: Boolean,
    default: true
  },
  addButton: {
    type: Object,
    default: () => ({})
  },
  // Loading Props
  loading: {
    type: Boolean,
    default: false
  },
  dataLoading: {
    type: Boolean,
    default: false
  },
  sortLoading: {
    type: Boolean,
    default: false
  },
  paginationLoading: {
    type: Boolean,
    default: false
  },
  bulkLoading: {
    type: Boolean,
    default: false
  },
  rowLoading: {
    type: Object,
    default: () => ({})
  },
  loadingType: {
    type: String,
    default: 'dots',
    validator: (value) => ['spin', 'pulse', 'bounce', 'ripple', 'bars', 'dots', 'ring'].includes(value)
  },
  loadingSize: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'xl'].includes(value)
  },
  loadingColor: {
    type: String,
    default: '#3b82f6'
  },
  loadingText: {
    type: String,
    default: 'Loading...'
  },
  loadingTextPosition: {
    type: String,
    default: 'bottom',
    validator: (value) => ['top', 'bottom'].includes(value)
  },
  loadingBackground: {
    type: String,
    default: 'rgba(255, 255, 255, 0.95)'
  },
  showSkeleton: {
    type: Boolean,
    default: true
  },
  skeletonRows: {
    type: Number,
    default: 10
  },
  // Toolbar
  showToolbar: {
    type: Boolean,
    default: false
  },
  showDensityToggle: {
    type: Boolean,
    default: true
  },
  showColumnToggle: {
    type: Boolean,
    default: true
  },
  showRefresh: {
    type: Boolean,
    default: true
  },
  showFilterDrawer: {
    type: Boolean,
    default: false
  },
  filterFields: {
    type: Array,
    default: () => []
  },
  filterRules: {
    type: Object,
    default: () => ({ logic: 'all', rules: [] })
  },
  defaultFilterRules: {
    type: Object,
    default: () => ({ logic: 'all', rules: [] })
  },
  themeScope: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'module'].includes(value)
  }
})

const emit = defineEmits([
  'selection-change',
  'sort-change',
  'row-click',
  'page-change',
  'page-size-change',
  'refresh',
  'action',
  'update:density',
  'toggle-column',
  'add',
  'add-button-click',
  'update:filterRules'
])
const slots = useSlots()

const currentPage = ref(1)
const pageSize = ref(props.pageSize)
const visibleColumnKeys = ref(props.columns.map(col => col.key))
const sortColumn = ref(props.sortBy)
const sortDirection = ref(props.sortOrder)
const showModal = ref(false)
const modalContent = ref('')
const showFilterDrawerPanel = ref(false)
const viewedRowKeys = ref(new Set())
const tableLoadedAt = ref(Date.now())

const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined
  return String(path).split('.').reduce((acc, key) => acc?.[key], obj)
}
const activeRuleCount = computed(() => Array.isArray(props.filterRules?.rules) ? props.filterRules.rules.length : 0)
const formatRuleValue = (value) => {
  if (value && typeof value === 'object') {
    const from = value.from || ''
    const to = value.to || ''
    return from && to ? `${from} to ${to}` : (from || to || '')
  }
  return String(value ?? '')
}
const clearFilterRules = () => emit('update:filterRules', { logic: 'all', rules: [] })
const toolbarActiveFilters = computed(() =>
  (props.filterRules?.rules || []).map((rule) => ({
    id: rule.id,
    label: rule.label,
    value: formatRuleValue(rule.value)
  }))
)

// CVA variants
const tableContainerVariants = cva('border ui-border-strong rounded-2xl relative overflow-hidden flex flex-col gap-y-2 px-2 pb-2', {
  variants: {
    variant: {
      default: 'shadow-sm ui-border-strong',
      bordered: 'border-2 ui-border-strong',
      minimal: 'border-none ui-border-strong shadow-none bg-transparent'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

const tableVariants = cva('min-w-full', {
  variants: {
    variant: {
      default: 'divide-y divide-(--ui-border-strong)',
      bordered: 'border-collapse [&_td]:border [&_th]:border [&_td]:border-(--ui-border-strong) [&_th]:border-(--ui-border-strong)',
      minimal: 'divide-y divide-(--ui-border-strong)'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

const headVariants = cva('', {
  variants: {
    variant: {
      default: ' border-b border-(--ui-border-strong)',
      bordered: ' border-b-2 border-(--ui-border-strong)',
      minimal: 'bg-transparent border-b border-(--ui-border-strong)'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

const bodyVariants = cva('divide-y', {
  variants: {
    variant: {
      default: ' divide-(--ui-border-strong)',
      bordered: ' divide-(--ui-border-strong)',
      minimal: 'bg-transparent divide-(--ui-border-strong)'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

// Computed properties
const filteredData = computed(() => {
  let data = [...props.data]

  // Apply sorting
  if (sortColumn.value) {
    const column = props.columns.find(col => col.key === sortColumn.value)
    if (column) {
      data.sort((a, b) => {
        const aVal = getCellValue(a, column)
        const bVal = getCellValue(b, column)

        if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
        return 0
      })
    }
  }

  return data
})

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / pageSize.value)
})

const paginatedData = computed(() => {
  if (!props.showPagination) return filteredData.value

  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

const displayedColumns = computed(() =>
  props.columns.filter(col => visibleColumnKeys.value.includes(col.key))
)

const toggleableColumns = computed(() =>
  props.columns.filter(col => col.toggleable !== false)
)

const handleToggleColumn = (key, visible) => {
  if (visible) {
    if (!visibleColumnKeys.value.includes(key)) {
      visibleColumnKeys.value.push(key)
    }
  } else {
    visibleColumnKeys.value = visibleColumnKeys.value.filter(k => k !== key)
  }
  emit('toggle-column', { key, visible })
}

// Check if actions column should be displayed based on permissions
const shouldShowActionsColumn = computed(() => {
  if (!props.showActionsColumn) return false

  // If using custom actions slot, always show
  if (slots.actions) return true

  // If no actions defined, don't show
  if (!props.actions || props.actions.length === 0) return false

  // Check if user has any actionable permissions
  const hasActionablePermission = props.actions.some(action => {
    if (action.permission === undefined) return true

    // If permission is boolean, check it directly
    if (typeof action.permission === 'boolean') {
      return action.permission === true
    }

    // If permission is a function, we assume it might grant access
    // This will be filtered per-row by getVisibleActions
    if (typeof action.permission === 'function') {
      return true
    }

    return false
  })

  return hasActionablePermission
})

const totalColumns = computed(() => {
  let count = props.columns.length
  if (props.selectable) count++
  if (shouldShowActionsColumn.value) count++
  return count
})

// Computed property to get visible actions for a specific item
const getVisibleActions = (item) => {
  return props.actions.filter(action => {
    // Check permission first - if no permission, don't show the action
    if (action.permission !== undefined) {
      // If permission is a function, call it
      if (typeof action.permission === 'function') {
        if (!action.permission(item)) {
          return false
        }
      }
      // If permission is a boolean value
      else if (!action.permission) {
        return false
      }
    }

    // Check visibility function
    if (action.visible && typeof action.visible === 'function') {
      return action.visible(item)
    }

    return true
  })
}

// Check if action has permission
const hasPermission = (action, item) => {
  if (action.permission && typeof action.permission === 'function') {
    return action.permission(item)
  }
  return true
}

// Check if action is disabled
const isActionDisabled = (action, item) => {
  if (action.disabled && typeof action.disabled === 'function') {
    return action.disabled(item)
  }
  return false
}

// Handle action click
const handleActionClick = (action, item) => {
  if (isActionDisabled(action, item) || !hasPermission(action, item)) {
    return
  }

  // Emit action event
  emit('action', { action: action.key, item, actionConfig: action })

  // Call optional onClick handler
  if (action.onClick && typeof action.onClick === 'function') {
    action.onClick(item)
  }
}

// Map action variant to Button component variant
const getButtonVariant = (actionVariant) => {
  const variantMap = {
    default: 'default',
    primary: 'gradient',
    secondary: 'secondary',
    danger: 'danger',
    success: 'success',
    warning: 'warning',
    info: 'info',
    subtle: 'subtle',
    dark: 'dark',
    light: 'light',
    primaryOutline: 'primaryOutline',
    dangerOutline: 'dangerOutline',
    successOutline: 'successOutline',
    outline: 'outline',
    link: 'link',
    ghost: 'ghost'
  }

  return variantMap[actionVariant] || 'ghost'
}


const isAllSelected = computed(() => {
  return filteredData.value.length > 0 &&
    filteredData.value.every(item => isRowSelected(item))
})

const isIndeterminate = computed(() => {
  const selectedCount = filteredData.value.filter(item => isRowSelected(item)).length
  return selectedCount > 0 && selectedCount < filteredData.value.length
})

// Methods
const getCellValue = (item, column) => {
  if (column.accessor) {
    return column.accessor(item)
  }

  return column.key.split('.').reduce((obj, key) => obj?.[key], item)
}

const getRowKey = (item, index) => {
  return item[props.rowKey] || index
}

const isRowSelected = (item) => {
  return props.selectedItems.some(selected =>
    getRowKey(selected) === getRowKey(item)
  )
}

const toggleRowSelection = (item) => {
  const newSelection = [...props.selectedItems]
  const index = newSelection.findIndex(selected =>
    getRowKey(selected) === getRowKey(item)
  )

  if (index > -1) {
    newSelection.splice(index, 1)
  } else {
    newSelection.push(item)
  }

  emit('selection-change', newSelection)
}

const toggleSelectAll = () => {
  if (props.loading || props.dataLoading) return

  const newSelection = isAllSelected.value ? [] : [...filteredData.value]
  emit('selection-change', newSelection)
}

const handleSort = async (column) => {
  if (!column.sortable || props.loading || props.sortLoading) return

  if (sortColumn.value === column.key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column.key
    sortDirection.value = 'asc'
  }

  emit('sort-change', { column: column.key, direction: sortDirection.value })
}

const handleRowClick = (payload) => {
  if (props.loading) return
  if (props.highlightUnreadRows) {
    const key = getRowKey(payload.item, payload.index)
    viewedRowKeys.value.add(String(key))
    persistReadKeys()
  }
  emit('row-click', payload)
}

const isUnreadRow = (item, index) => {
  if (!props.highlightUnreadRows) return false

  const key = String(getRowKey(item, index))
  if (viewedRowKeys.value.has(key)) return false

  if (props.unreadMode === 'all') return true

  const field = props.unreadCreatedAtField
  if (!field) return false
  const createdAtValue = field.includes('.') ? getNestedValue(item, field) : item?.[field]
  if (!createdAtValue) return false

  const rawValue = String(createdAtValue).trim()
  let createdAt = new Date(rawValue).getTime()

  // Accept dd-mm-yyyy or dd/mm/yyyy formats.
  if (Number.isNaN(createdAt)) {
    const match = rawValue.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/)
    if (match) {
      const [, dd, mm, yyyy] = match
      createdAt = new Date(`${yyyy}-${mm}-${dd}T00:00:00`).getTime()
    }
  }
  if (Number.isNaN(createdAt)) return false

  // If field is date-only (YYYY-MM-DD), compare by day boundary.
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
    const loadedDayStart = new Date(tableLoadedAt.value)
    loadedDayStart.setHours(0, 0, 0, 0)
    return createdAt >= loadedDayStart.getTime()
  }

  return createdAt >= tableLoadedAt.value
}

const getUnreadRowClass = (item, index) => {
  if (!props.highlightUnreadRows) return ''

  if (isUnreadRow(item, index)) {
    return 'font-bold !bg-[color:color-mix(in_oklab,var(--module-soft,var(--ui-primary-soft))_62%,var(--ui-surface)_38%)]'
  }

  return 'font-normal !bg-[color:color-mix(in_oklab,var(--module-soft-alt,var(--ui-surface-soft))_42%,var(--ui-surface)_58%)]'
}

const loadPersistedReadKeys = () => {
  if (!props.unreadPersistKey || typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(props.unreadPersistKey)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) viewedRowKeys.value = new Set(parsed.map(String))
  } catch {
    // no-op
  }
}

const persistReadKeys = () => {
  if (!props.unreadPersistKey || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(props.unreadPersistKey, JSON.stringify(Array.from(viewedRowKeys.value)))
  } catch {
    // no-op
  }
}

const handlePageChange = async (page) => {
  if (props.paginationLoading || props.loading) return

  currentPage.value = page
  emit('page-change', page)
}

const handlePageSizeChange = async (size) => {
  if (props.paginationLoading || props.loading) return

  pageSize.value = size
  currentPage.value = 1 // Reset to first page
  emit('page-size-change', size)
}

// Style classes using CVA
const tableContainerClasses = computed(() =>
  cn(
    tableContainerVariants({ variant: props.variant }),
    props.themeScope === 'module' && 'kv-module-themed-table'
  )
)

const tableClasses = computed(() =>
  cn(tableVariants({ variant: props.variant }))
)

const headClasses = computed(() =>
  cn(headVariants({ variant: props.variant }))
)

const bodyClasses = computed(() =>
  cn(bodyVariants({ variant: props.variant }))
)

const getHeaderCellClasses = (column) => {
  const densityPadding = {
    compact: 'px-3.5 py-1.5',
    normal: 'px-6 py-3',
    comfortable: 'px-8 py-4'
  }

  return cn(
    densityPadding[props.density],
    'text-left text-sm font-extrabold ui-text uppercase tracking-wider',
    {
      'cursor-pointer hover:bg-(--ui-surface) transition-colors': column.sortable && !props.loading && !props.sortLoading,
      'cursor-not-allowed opacity-50': props.loading || (props.sortLoading && sortColumn.value === column.key)
    }
  )
}

const getDataCellClasses = () => {
  const densityPadding = {
    compact: 'px-3.5 py-1.5',
    normal: 'px-6 py-4',
    comfortable: 'px-8 py-6'
  }

  return cn(
    densityPadding[props.density],
    'whitespace-nowrap text-sm ui-text'
  )
}

const formatCellValue = (item, column) => {
  const value = getCellValue(item, column)

  if (typeof column === 'object' && column.formatter) {
    return column.formatter(value, item)
  }

  if (value == null) {
    return ''
  }

  if (value instanceof Date) {
    return value.toLocaleDateString()
  }

  if (Array.isArray(value)) {
    return value.join(', ')
  }

  return value
}

const truncateText = (text, maxWords = 10) => {
  if (!text) return text
  const words = text.toString().split(' ')
  if (words.length <= maxWords) return text
  return words.slice(0, maxWords).join(' ') + '...'
}

const openModal = (content) => {
  // We'll need to emit this to parent or handle modal state here
  // For now, let's create a simple modal state
  if (!modalContent.value) {
    modalContent.value = content
    showModal.value = true
  }
}

const closeModal = () => {
  showModal.value = false
  modalContent.value = ''
}

const checkboxCellClasses = computed(() => {
  const densityPadding = {
    compact: 'px-3.5 py-1.5',
    normal: 'px-6 py-4',
    comfortable: 'px-8 py-6'
  }

  return cn(
    densityPadding[props.density],
    'whitespace-nowrap text-sm ui-text w-12'
  )
})

const actionsCellClasses = computed(() => {
  const densityPadding = {
    compact: 'px-3.5 py-1.5',
    normal: 'px-6 py-4',
    comfortable: 'px-8 py-6'
  }

  return cn(
    densityPadding[props.density],
    'whitespace-nowrap text-md font-extrabold text-center'
  )
})

const emptyCellClasses = computed(() => {
  const densityPadding = {
    compact: 'px-4 py-4',
    normal: 'px-6 py-6',
    comfortable: 'px-8 py-8'
  }

  return cn(
    densityPadding[props.density],
    'text-center'
  )
})

const getSortIconClasses = (column, direction) => cn(
  {
    'ui-primary': sortColumn.value === column.key && sortDirection.value === direction,
    'ui-text': sortColumn.value !== column.key || sortDirection.value !== direction
  }
)

// Watch for external changes
watch(() => props.selectedItems, () => {
  // Handle external selection changes if needed
}, { deep: true })

// Watch for prop changes
watch(() => props.pageSize, (newPageSize) => {
  pageSize.value = newPageSize
})

watch(() => props.columns, (newColumns) => {
  visibleColumnKeys.value = newColumns.map(col => col.key)
}, { deep: true })

// Expose methods for parent components
defineExpose({
  refresh: () => {
    // Emit event to refresh data
    emit('refresh')
  },
  goToPage: (page) => {
    handlePageChange(page)
  },
  selectAll: () => {
    toggleSelectAll()
  },
  clearSelection: () => {
    emit('selection-change', [])
  },
  getCurrentPage: () => currentPage.value,
  getTotalPages: () => totalPages.value,
  getSelectedItems: () => props.selectedItems
})

loadPersistedReadKeys()
</script>

<template>
  <div :class="tableContainerClasses">
    <!-- Header Component -->
    <DataTableHeader v-if="title || description || $slots.header" :title="title" :description="description"
      :variant="headerVariant" :padding="headerPadding">
      <template #header>
        <slot name="header" />
      </template>
      <template #filters>
        <slot name="filters" />
      </template>
    </DataTableHeader>

    <!-- Toolbar Component -->
    <DataTableToolBar v-if="showToolbar" :selected-items="selectedItems" :total-items="filteredData.length"
      :show-density-toggle="showDensityToggle" :show-column-toggle="showColumnToggle" :show-refresh="showRefresh"
      :active-filters="showFilterDrawer ? toolbarActiveFilters : []" :default-filter-rules="defaultFilterRules"
      :add-button="addButton" :density="density" :toggleable-columns="toggleableColumns"
      :visible-columns="visibleColumnKeys" @update:density="(value) => emit('update:density', value)"
      @toggle-column="handleToggleColumn" @refresh="$emit('refresh')" @add="emit('add')"
      @add-button-click="(config) => emit('add-button-click', config)">
      <template #actions>
        <slot name="toolbar-actions" />
      </template>
      <template #actions-after-add>
        <button v-if="showFilterDrawer"
          class="px-3 py-2 text-sm border ui-border-strong rounded-md hover:bg-(--ui-surface) flex items-center gap-2"
          @click="showFilterDrawerPanel = true">
          <font-awesome-icon icon="filter" />
          Filter
          <span v-if="activeRuleCount > 0"
            class="inline-flex items-center justify-center min-w-5 h-5 rounded-full text-xs ui-primary-bg text-white px-1">
            {{ activeRuleCount }}
          </span>
        </button>
        <slot name="toolbar-actions-after-add" />
      </template>
      <template #active-filter-actions>
        <button v-if="showFilterDrawer && activeRuleCount > 0"
          class="ml-1 px-2 py-1 text-sm border border-(--ui-primary) rounded-md ui-primary hover:bg-(--ui-primary-soft)"
          @click="clearFilterRules">
          Clear filter
        </button>
      </template>
    </DataTableToolBar>
    <FilterDrawer v-if="showFilterDrawer" :open="showFilterDrawerPanel" :fields="filterFields"
      :model-value="filterRules" @update:modelValue="$emit('update:filterRules', $event)"
      @close="showFilterDrawerPanel = false" />

    <!-- Loading Overlay for entire table -->
    <div class="relative">
      <Loader v-if="loading" :loading="true" :type="loadingType" :size="loadingSize" :color="loadingColor"
        :overlay="true" :text="loadingText" :text-position="loadingTextPosition" :background-color="loadingBackground"
        class="table-loading-overlay" />

      <!-- Table -->
      <div class="overflow-x-auto" :class="{ 'opacity-50': loading }">
        <table :class="tableClasses">
          <!-- Table Head -->
          <thead :class="headClasses">
            <tr>
              <!-- Selection Column Header -->
              <th v-if="selectable" :class="checkboxCellClasses">
                <div class="flex items-center justify-center">
                  <!-- Header loading for bulk operations -->
                  <Loader v-if="bulkLoading" :loading="true" type="spin" size="small" :color="loadingColor" />
                  <Checkbox v-else :model-value="isAllSelected" :indeterminate="isIndeterminate"
                    :disabled="loading || dataLoading" @update:model-value="toggleSelectAll" />
                </div>
              </th>

              <!-- Data Column Headers -->
              <th v-for="column in displayedColumns" :key="column.key" :class="getHeaderCellClasses(column)"
                @click="handleSort(column)">
                <div class="flex items-center gap-2">
                  <span>{{ column.label }}</span>

                  <!-- Sort loading indicator -->
                  <Loader v-if="sortLoading && sortColumn === column.key" :loading="true" type="spin" size="small"
                    :color="loadingColor" />

                  <!-- Sort icons -->
                  <div v-else-if="column.sortable" class="flex flex-col">
                    <svg :class="getSortIconClasses(column, 'asc')" class="w-3 h-3 transition-colors" fill="none"
                      viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                    </svg>
                    <svg :class="getSortIconClasses(column, 'desc')" class="w-3 h-3 transition-colors" fill="none"
                      viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </th>

              <!-- Actions Column Header -->
              <th v-if="shouldShowActionsColumn" :class="actionsCellClasses">
                Actions
              </th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody :class="bodyClasses">
            <!-- Skeleton Loading Rows - Show first when loading -->
            <template v-if="showSkeleton && (loading || dataLoading)">
              <tr v-for="n in skeletonRows" :key="`skeleton-${n}`" class="animate-pulse">
                <!-- Selection checkbox skeleton -->
                <td v-if="selectable" :class="checkboxCellClasses">
                  <div class="w-4 h-4 ui-bg rounded" />
                </td>

                <!-- Data columns skeleton -->
                <td v-for="column in displayedColumns" :key="column.key" :class="getDataCellClasses()">
                  <div class="h-4 ui-bg rounded w-3/4" />
                </td>

                <!-- Actions column skeleton -->
                <td v-if="shouldShowActionsColumn" :class="actionsCellClasses">
                  <div class="flex gap-2 justify-center">
                    <div class="w-6 h-6 ui-surface rounded" />
                    <div class="w-6 h-6 ui-surface rounded" />
                  </div>
                </td>
              </tr>
            </template>

            <!-- Data Rows - Show when not loading and has data -->
            <template v-else-if="paginatedData.length > 0">
              <DataTableRow v-for="(item, index) in paginatedData" :key="getRowKey(item, index)" :item="item"
                :columns="displayedColumns" :index="index" :selectable="selectable" :is-selected="isRowSelected(item)"
                :striped="striped" :hoverable="hoverable" :clickable-rows="clickableRows"
                :row-class="getUnreadRowClass(item, index)" :density="density" :variant="variant"
                @toggle-selection="toggleRowSelection" @row-click="handleRowClick">
                <template v-for="column in displayedColumns" :key="column.key" #[`cell-${column.key}`]="slotProps">
                  <slot :name="`cell-${column.key}`" v-bind="slotProps">
                    <span v-if="formatCellValue(slotProps.item, slotProps.column).toString().split(' ').length > 10"
                      class="cursor-pointer ui-primary hover:text-(--ui-primary)"
                      @click.stop="openModal(formatCellValue(slotProps.item, slotProps.column))">
                      {{ truncateText(formatCellValue(slotProps.item, slotProps.column)) }}
                    </span>
                    <span v-else>
                      {{ formatCellValue(slotProps.item, slotProps.column) }}
                    </span>
                  </slot>
                </template>

                <template #actions="{ item: actionItem, index: actionIndex }">
                  <slot v-if="$slots.actions" name="actions" :item="actionItem" :index="actionIndex" />

                  <div v-else-if="actions.length > 0" class="flex items-center gap-1 justify-center">
                    <Tooltip v-for="action in getVisibleActions(actionItem)" :key="action.key"
                      :content="typeof action.tooltip === 'function' ? action.tooltip(actionItem) : (action.tooltip || action.label || action.key)"
                      placement="top">
                      <Button :variant="getButtonVariant(action.variant)" size="xs"
                        :disabled="isActionDisabled(action, actionItem) || !hasPermission(action, actionItem)"
                        :class="['h-8 w-8', typeof action.class === 'function' ? action.class(actionItem) : action.class]"
                        @click.stop="handleActionClick(action, actionItem)">
                        <Icon v-if="action.icon" :icon="action.icon" class="w-4 h-4" />
                        <span v-else-if="action.label" class="text-xs">{{ action.label }}</span>
                      </Button>
                    </Tooltip>
                  </div>
                </template>
              </DataTableRow>
            </template>

            <!-- Empty State Row - Show when not loading and no data -->
            <tr v-else>
              <td :colspan="totalColumns" :class="emptyCellClasses">
                <slot name="empty">
                  <div class="flex flex-col items-center justify-center py-12">
                    <div class="ui-text mb-4 flex justify-center">
                      <Icon icon="search" class="w-16 h-16" />
                    </div>
                    <p class="ui-text text-lg font-medium mb-2">
                      {{ emptyText }}
                    </p>
                    <p class="ui-text text-sm">
                      {{ emptySubtitle }}
                    </p>
                  </div>
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Footer/Pagination Component -->
    <DataTablePagination v-if="showPagination || $slots.footer" :current-page="currentPage" :total-pages="totalPages"
      :total="filteredData.length" :page-size="pageSize" :show-pagination="showPagination" :selectable="selectable"
      :selected-count="selectedItems.length" :variant="paginationVariant" :padding="paginationPadding"
      :loading="paginationLoading" :disabled="loading || dataLoading" @update:current-page="handlePageChange"
      @update:page-size="handlePageSizeChange">
      <template #footer>
        <slot name="footer" />
      </template>
    </DataTablePagination>

    <!-- Modal for full text display -->
    <Modal v-model="showModal" size="lg" @close="closeModal">
      <div class="p-6">
        <h3 class="text-md font-semibold mb-4">
          Full Text
        </h3>
        <div class="text-xl font-bold ui-text whitespace-pre-wrap wrap-break-word">
          {{ modalContent }}
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.table-loading-overlay {
  border-radius: 0.5rem;
  z-index: 10;
}

.kv-module-themed-table :deep(thead th) {
  background: var(--module-soft, var(--ui-primary-soft));
  color: var(--module-text, var(--ui-primary));
  border-bottom-color: var(--module-border, var(--ui-border-strong));
}

.kv-module-themed-table :deep(tbody tr:nth-child(odd)) {
  background: var(--module-soft-alt, transparent);
}

.kv-module-themed-table :deep(tbody tr:nth-child(even)) {
  background: color-mix(in oklab,
      var(--module-soft-alt, transparent) 55%,
      transparent 45%);
}

/* Custom skeleton animation */
@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
