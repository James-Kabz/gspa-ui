<script>

// Default bulk actions
const defaultBulkActions = [
  {
    key: 'delete',
    label: 'Delete',
    icon: {
      render() {
        return h('svg', {
          fill: 'none',
          viewBox: '0 0 24 24',
          'stroke-width': '1.5',
          stroke: 'currentColor'
        }, [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            d: 'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0'
          })
        ])
      }
    },
    variant: 'danger'
  },
  {
    key: 'edit',
    label: 'Edit',
    icon: {
      render() {
        return h('svg', {
          fill: 'none',
          viewBox: '0 0 24 24',
          'stroke-width': '1.5',
          stroke: 'currentColor'
        }, [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            d: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10'
          })
        ])
      }
    },
    variant: 'primary'
  }
]

export default {
  name: 'DataTableToolBar'
}
</script>

<script setup>
import Button from './Button.vue'
import Icon from './Icon.vue'
import FilterDrawer from './FilterDrawer.vue'
import { ref, computed, onMounted, onUnmounted, h, watch } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

const props = defineProps({
  selectedItems: { type: Array, default: () => [] },
  totalItems: { type: Number, default: 0 },
  itemLabel: { type: String, default: 'items' },
  showTableInfo: { type: Boolean, default: false },
  showItemCount: { type: Boolean, default: false },
  bulkActions: { type: Array, default: () => defaultBulkActions },
  showDensityToggle: { type: Boolean, default: true },
  showColumnToggle: { type: Boolean, default: true },
  showRefresh: { type: Boolean, default: true },
  showSearch: { type: Boolean, default: true },
  searchQuery: { type: String, default: '' },
  searchPlaceholder: { type: String, default: 'Search...' },
  addButton: { type: Object, default: () => ({}) },
  isRefreshing: { type: Boolean, default: false },
  density: {
    type: String,
    default: 'compact',
    validator: (v) => ['compact', 'normal', 'comfortable'].includes(v)
  },
  toggleableColumns: { type: Array, default: () => [] },
  visibleColumns: { type: Array, default: () => [] },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'minimal', 'bordered'].includes(value)
  },
  padding: {
    type: String,
    default: 'normal',
    validator: (value) => ['compact', 'normal', 'comfortable'].includes(value)
  },
  themeScope: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'module'].includes(value)
  },
  activeFilters: {
    type: Array,
    default: () => []
  },
  enableFilters: {
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
  }
})

const emit = defineEmits([
  'bulk-action',
  'update:density',
  'toggle-column',
  'refresh',
  'update:search-query',
  'add',
  'add-button-click',
  'update:filterRules'
])

// Refs
const showColumnMenu = ref(false)
const showFilterDrawer = ref(false)
const defaultRulesApplied = ref(false)
const columnToggleButton = ref(null)
const columnMenu = ref(null)
const columnMenuStyle = ref({})

const selectedCount = computed(() => props.selectedItems.length)
const hasAddButton = computed(() => Object.keys(props.addButton || {}).length > 0)

const hasAddButtonPermission = computed(() => {
  if (!hasAddButton.value) return false
  if (props.addButton.permission === undefined) return true
  if (typeof props.addButton.permission === 'function') return props.addButton.permission()
  return Boolean(props.addButton.permission)
})

const isAddButtonVisible = computed(() => {
  if (!hasAddButton.value || !hasAddButtonPermission.value) return false
  if (typeof props.addButton.visible === 'function') return props.addButton.visible()
  if (props.addButton.visible === undefined) return true
  return Boolean(props.addButton.visible)
})

const isAddButtonDisabled = computed(() => {
  if (!isAddButtonVisible.value) return true
  if (typeof props.addButton.disabled === 'function') return props.addButton.disabled()
  return Boolean(props.addButton.disabled)
})

const addButtonTooltip = computed(() => props.addButton.tooltip || props.addButton.label || 'Add new item')

const densityOptions = [
  { value: 'compact', label: 'Compact', icon: ['fas', 'minus'] },
  { value: 'normal', label: 'Normal', icon: ['fas', 'bars'] },
  { value: 'comfortable', label: 'Comfortable', icon: ['fas', 'bars-staggered'] }
]


// CVA Variants
const toolbarVariants = cva('flex items-center justify-between border ui-border-strong rounded-2xl', {
  variants: {
    variant: {
      default: 'ui-border-strong',
      minimal: 'bg-transparent ui-border-strong',
      bordered: ' ui-border-strong'
    },
    padding: {
      compact: 'p-2',
      normal: 'p-4',
      comfortable: 'p-6'
    }
  },
  defaultVariants: {
    variant: 'default',
    padding: 'normal'
  }
})

const bulkActionVariants = cva('px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1 transition-colors ', {
  variants: {
    variant: {
      danger: 'ui-danger ui-danger-bg hover:bg-(--ui-danger-soft) border border-(--ui-danger-soft)',
      primary: 'ui-primary ui-primary-soft hover:bg-(--ui-primary-soft) border border-(--ui-primary-soft)',
      secondary: 'ui-text ui-bg hover:bg-(--ui-bg) border ui-border-strong'
    }
  },
  defaultVariants: {
    variant: 'secondary'
  }
});

const densityButtonVariants = cva('p-2 border ui-border-strong  transition-colors ', {
  variants: {
    active: {
      true: 'ui-primary-soft ui-primary border-(--ui-primary-soft)',
      false: 'ui-surface ui-text hover:bg-(--ui-surface)'
    },
    position: {
      first: 'rounded-l-md border-r-0',
      middle: 'border-x-0',
      last: 'rounded-r-md border-l-0'
    }
  },
  defaultVariants: {
    active: false,
    position: 'middle'
  }
})

const refreshButtonVariants = cva('px-3 py-2 text-sm border ui-border-strong rounded-md flex items-center gap-2 transition-colors ', {
  variants: {
    state: {
      normal: 'ui-text hover:text-(--ui-text) hover:bg-(--ui-surface)',
      refreshing: 'ui-text opacity-75 cursor-not-allowed'
    }
  },
  defaultVariants: {
    state: 'normal'
  }
})

// Computed Classes
const toolbarClasses = computed(() => 
  cn(
    toolbarVariants({ 
      variant: props.variant, 
      padding: props.padding 
    }),
    props.themeScope === 'module' && 'kv-module-themed-toolbar'
  )
)

const itemCountClasses = computed(() => 'text-md ui-text')
const densityToggleClasses = computed(() => 'flex items-center')

const columnToggleButtonClasses = computed(() => 
  'flex items-center gap-2 px-3 py-2 text-sm ui-text hover:text-(--ui-text) border ui-border-strong rounded-md  hover:brightness-105 transition-colors focus:outline-none focus:ring-2 focus:ring-(--ui-primary) focus:ring-offset-1'
)

const columnMenuClasses = computed(() => 
  'ui-bg  rounded-lg shadow-lg z-[9999] max-h-64 overflow-y-auto'
)

const columnMenuHeaderClasses = computed(() => 
  'text-xs font-medium ui-text uppercase tracking-wider mb-2 border-b ui-border-strong pb-2'
)

const columnMenuItemClasses = computed(() => 
  'py-1 hover:bg-(--ui-surface) rounded transition-colors'
)

const checkboxClasses = computed(() => 
  'w-4 h-4 rounded ui-border-strong ui-primary focus:ring-(--ui-primary) focus:ring-2 focus:ring-offset-1'
)

const labelClasses = computed(() => 
  'text-sm ui-text flex-1 select-none'
)

const searchInputClasses = computed(() =>
  'w-72 pl-9 pr-3 py-2 text-sm border ui-border-strong rounded-md ui-surface ui-text placeholder:text-(--ui-text-muted) focus:outline-none focus:ring-2 focus:ring-(--ui-primary) focus:border-transparent transition-all'
)

// Click outside handler
const updateColumnMenuPosition = () => {
  if (!columnToggleButton.value) return
  const rect = columnToggleButton.value.getBoundingClientRect()
  const width = 224
  const left = Math.max(12, rect.right - width)
  columnMenuStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 6}px`,
    left: `${left}px`,
    width: `${width}px`,
    zIndex: 9999
  }
}

const handleClickOutside = (event) => {
  if (
    columnToggleButton.value &&
    columnMenu.value &&
    !columnToggleButton.value.contains(event.target) &&
    !columnMenu.value.contains(event.target)
  ) {
    showColumnMenu.value = false
  }
}

// Methods
const toggleColumnMenu = () => {
  showColumnMenu.value = !showColumnMenu.value
  if (showColumnMenu.value) {
    updateColumnMenuPosition()
  }
}

const getBulkActionClasses = (action) => 
  cn(bulkActionVariants({ variant: action.variant || 'secondary' }))

const getDensityButtonClasses = (densityValue) => {
  let position = 'middle'
  if (densityValue === 'compact') position = 'first'
  else if (densityValue === 'comfortable') position = 'last'

  return cn(densityButtonVariants({
    active: props.density === densityValue,
    position
  }))
}

const getRefreshButtonClasses = () => 
  cn(refreshButtonVariants({ 
    state: props.isRefreshing ? 'refreshing' : 'normal' 
  }))

const getRefreshIconClasses = () => 
  cn('w-4 h-4', {
    'animate-spin': props.isRefreshing
  })

const isColumnVisible = (columnKey) => props.visibleColumns.includes(columnKey)

const toggleColumn = (columnKey, visible) => {
  emit('toggle-column', { column: columnKey, visible })
}

const handleAddButtonClick = () => {
  if (isAddButtonDisabled.value) return
  emit('add')
  emit('add-button-click', props.addButton)
  if (typeof props.addButton.onClick === 'function') {
    props.addButton.onClick()
  }
}

const internalActiveFilters = computed(() =>
  (props.filterRules?.rules || []).map((rule) => ({
    id: rule.id,
    label: rule.label,
    value: typeof rule.value === 'object'
      ? `${rule.value.from || ''}${rule.value.from || rule.value.to ? ' to ' : ''}${rule.value.to || ''}`
      : String(rule.value ?? '')
  }))
)

const removeOneFilter = (filterId) => {
  const rules = Array.isArray(props.filterRules?.rules) ? props.filterRules.rules : []
  emit('update:filterRules', {
    logic: props.filterRules?.logic || 'all',
    rules: rules.filter((rule) => rule.id !== filterId)
  })
}

watch(
  () => props.defaultFilterRules,
  (value) => {
    if (defaultRulesApplied.value || !props.enableFilters) return
    const rules = Array.isArray(value?.rules) ? value.rules : []
    if (rules.length === 0) return
    emit('update:filterRules', {
      logic: value?.logic || 'all',
      rules
    })
    defaultRulesApplied.value = true
  },
  { immediate: true, deep: true }
)

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', updateColumnMenuPosition, true)
  window.addEventListener('resize', updateColumnMenuPosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', updateColumnMenuPosition, true)
  window.removeEventListener('resize', updateColumnMenuPosition)
})
</script>


<template>
  <div class="flex flex-col rounded-2xl mb-2 px-2">
    <div :class="toolbarClasses">
      <!-- Left side - Selection actions -->
      <div class="flex items-center gap-3">
        <div
          v-if="selectedCount > 0"
          class="flex items-center gap-3"
        >
          <span class="text-sm ui-text">
            {{ selectedCount }} selected
          </span>

          <!-- Bulk actions -->
          <div class="flex items-center gap-2">
            <Button
              v-for="action in bulkActions"
              :key="action.key"
              :class="getBulkActionClasses(action)"
              @click="$emit('bulk-action', { action: action.key, items: selectedItems })"
            >
              <font-awesome-icon
                v-if="action.icon"
                :icon="action.icon"
                class="w-4 h-4"
              />
              {{ action.label }}
            </Button>
          </div>
        </div>

        <!-- Default info when no selection -->
        <div
          v-else-if="showItemCount && totalItems > 0"
          :class="itemCountClasses"
        >
          {{ totalItems }} {{ itemLabel }}
        </div>
      </div>

      <!-- Right side - View controls and actions -->
      <div class="flex items-center gap-3">
        <!-- View density toggle -->
        <div
          v-if="showDensityToggle"
          :class="densityToggleClasses"
        >
          <button
            v-for="option in densityOptions"
            :key="option.value"
            :class="getDensityButtonClasses(option.value)"
            :title="option.label"
            type="button"
            @click="$emit('update:density', option.value)"
          >
            <font-awesome-icon
              :icon="option.icon"
              class="w-4 h-4"
            />
          </button>
        </div>

        <!-- Column visibility toggle -->
        <div
          v-if="showColumnToggle"
          class="relative"
        >
          <button
            ref="columnToggleButton"
            :class="columnToggleButtonClasses"
            type="button"
            @click.stop="toggleColumnMenu"
          >
            <font-awesome-icon
              icon="columns"
              class="w-4 h-4"
            />
            <span>Columns</span>
          </button>

          <!-- Column menu -->
          <Teleport to="body">
            <div
              v-show="showColumnMenu"
              ref="columnMenu"
              :class="columnMenuClasses"
              :style="columnMenuStyle"
              @click.stop
            >
              <div class="p-3">
                <div :class="columnMenuHeaderClasses">
                  Show Columns
                </div>
                <div class="space-y-1">
                  <div
                    v-for="column in toggleableColumns"
                    :key="column.key"
                    :class="columnMenuItemClasses"
                  >
                    <label class="flex items-center gap-2 cursor-pointer w-full">
                      <input
                        type="checkbox"
                        :checked="isColumnVisible(column.key)"
                        :class="checkboxClasses"
                        @change="toggleColumn(column.key, $event.target.checked)"
                      >
                      <span :class="labelClasses">
                        {{ column.label }}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </Teleport>
        </div>

        <!-- Refresh button -->
        <button
          v-if="showRefresh"
          :disabled="isRefreshing"
          :class="getRefreshButtonClasses()"
          type="button"
          @click="$emit('refresh')"
        >
          <font-awesome-icon
            icon="sync"
            :class="getRefreshIconClasses()"
          />
          <span>Refresh</span>
        </button>

        <!-- Custom actions -->
        <div
          v-if="$slots.actions"
          class="flex items-center gap-2"
        >
          <slot name="actions" />
        </div>

        <!-- Search input (right-most control) -->
        <div
          v-if="showSearch"
          class="relative"
        >
          <font-awesome-icon
            icon="search"
            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ui-text-soft"
          />
          <input
            :value="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            :class="searchInputClasses"
            @input="$emit('update:search-query', $event.target.value)"
          >
        </div>

        <Button
          v-if="isAddButtonVisible"
          :variant="addButton.variant || 'success'"
          :disabled="isAddButtonDisabled"
          :title="addButtonTooltip"
          @click="handleAddButtonClick"
        >
          <Icon
            :icon="addButton.icon || 'plus'"
          />
          <span>{{ addButton.label || 'Add' }}</span>
        </Button>

        <button
          v-if="enableFilters"
          class="px-3 py-2 text-sm border ui-border-strong rounded-md hover:bg-(--ui-surface) flex items-center gap-2"
          @click="showFilterDrawer = true"
        >
          <font-awesome-icon icon="filter" />
          Filter
          <span
            v-if="(filterRules.rules || []).length"
            class="inline-flex items-center justify-center min-w-5 h-5 rounded-full text-xs ui-primary-bg text-white px-1"
          >
            {{ (filterRules.rules || []).length }}
          </span>
        </button>

        <div
          v-if="$slots['actions-after-add']"
          class="flex items-center gap-2"
        >
          <slot name="actions-after-add" />
        </div>
      </div>
    </div>
    <FilterDrawer
      v-if="enableFilters"
      :open="showFilterDrawer"
      :fields="filterFields"
      :model-value="filterRules"
      @update:modelValue="$emit('update:filterRules', $event)"
      @close="showFilterDrawer = false"
    />
    <div
      v-if="(enableFilters ? internalActiveFilters.length > 0 : activeFilters.length > 0)"
      class="mt-2 px-3 py-2 border ui-border-strong rounded-lg flex flex-wrap items-center gap-2 ui-surface"
    >
      <span class="text-sm ui-text-soft">Filters:</span>
      <span
        v-for="filter in (enableFilters ? internalActiveFilters : activeFilters)"
        :key="filter.id || `${filter.label}-${filter.value}`"
        class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm border ui-border-strong ui-text"
      >
        {{ filter.label }}: {{ filter.value }}
        <button
          v-if="enableFilters && filter.id"
          class="ml-1 ui-text-soft hover:ui-primary"
          @click="removeOneFilter(filter.id)"
        >
          <Icon icon="xmark" class="w-3 h-3" />
        </button>
      </span>
      <button
        v-if="enableFilters"
        class="ml-1 px-2 py-1 text-sm border border-(--ui-primary) rounded-md ui-primary hover:bg-(--ui-primary-soft)"
        @click="$emit('update:filterRules', { logic: defaultFilterRules?.logic || 'all', rules: defaultFilterRules?.rules || [] })"
      >
        Clear filter
      </button>
      <slot name="active-filter-actions" />
    </div>
  </div>
</template>

<style scoped>
.kv-module-themed-toolbar {
  border-color: var(--module-border, var(--ui-border-strong));
  background: color-mix(
    in oklab,
    var(--module-soft, var(--ui-primary-soft)) 50%,
    var(--ui-bg) 50%
  );
}

.kv-module-themed-toolbar :deep(button) {
  border-color: var(--module-border, var(--ui-border-strong));
}
</style>
