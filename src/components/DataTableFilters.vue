<script setup>
import Button from './Button.vue'
import Select from './Select.vue'
import { computed, ref } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'
import Icon from './Icon.vue'

const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...'
  },
  selectedStatus: {
    type: String,
    default: ''
  },
  statusOptions: {
    type: Array,
    default: () => []
  },
  // Legacy props for backward compatibility
  showDateFilter: {
    type: Boolean,
    default: false
  },
  dateFrom: {
    type: String,
    default: ''
  },
  dateTo: {
    type: String,
    default: ''
  },
  // Dynamic date filters prop (NO active property required)
  dateFilters: {
    type: Array,
    default: () => [],
    validator: (filters) => {
      return filters.every(filter =>
        Object.prototype.hasOwnProperty.call(filter, 'key') &&
        Object.prototype.hasOwnProperty.call(filter, 'label') &&
        Object.prototype.hasOwnProperty.call(filter, 'from') &&
        Object.prototype.hasOwnProperty.call(filter, 'to')
      )
    }
  },
  showExport: {
    type: Boolean,
    default: false
  },
  showAdd: {
    type: Boolean,
    default: false
  },
  showTableInfo: {
    type: Boolean,
    default: true
  },
  showSearch: {
    type: Boolean,
    default: true
  },
  showFilters: {
    type: Boolean,
    default: true
  },
  totalItems: {
    type: Number,
    default: 0
  },
  itemLabel: {
    type: String,
    default: 'items'
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'minimal', 'bordered'].includes(value)
  },
  padding: {
    type: String,
    default: 'normal',
    validator: (value) => ['compact', 'normal', 'comfortable'].includes(value)
  }
})

const emit = defineEmits([
  'update:searchQuery',
  'update:selectedStatus',
  'update:dateFrom',
  'update:dateTo',
  'update:dateFilters',
  'export',
  'add',
  'clear-filters'
])

// Local state
const showAdvancedFilters = ref(false)

// CVA Variants
const filtersVariants = cva('flex flex-wrap items-center gap-4', {
  variants: {
    variant: {
      default: 'bg-white',
      minimal: 'bg-transparent',
      bordered: 'bg-gray-50'
    },
    padding: {
      compact: 'px-4 py-3',
      normal: 'px-6 py-4',
      comfortable: 'px-8 py-6'
    }
  },
  defaultVariants: {
    variant: 'default',
    padding: 'normal'
  }
})

const inputVariants = cva('border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm', {
  variants: {
    size: {
      sm: 'px-2 py-1.5',
      md: 'px-3 py-2.5',
      lg: 'px-4 py-3'
    }
  },
  defaultVariants: {
    size: 'md'
  }
})

const buttonVariants = cva('rounded-lg flex items-center font-medium transition-all', {
  variants: {
    variant: {
      default: 'text-gray-700 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 bg-white',
      primary: 'text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 shadow-sm',
      success: 'text-white bg-green-600 hover:bg-green-700 border border-green-600 shadow-sm',
      ghost: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
    },
    size: {
      sm: 'px-2 py-1.5 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2.5 text-sm'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'md'
  }
})

const hasDateFilterValues = (dateFilter) => {
  return !!(dateFilter.from || dateFilter.to)
}

const clearDateFilter = (key) => {
  const updatedFilters = [...props.dateFilters]
  const filterIndex = updatedFilters.findIndex(f => f.key === key)

  if (filterIndex >= 0) {
    updatedFilters[filterIndex] = {
      ...updatedFilters[filterIndex],
      from: '',
      to: ''
    }
    emit('update:dateFilters', updatedFilters)
  }
}

const getDateFilterStatusClasses = (dateFilter) => {
  const hasValues = hasDateFilterValues(dateFilter)
  return `text-xs px-2 py-1 rounded ${hasValues
      ? 'bg-blue-100 text-blue-700'
      : 'bg-gray-100 text-gray-600'
    }`
}

// Methods
const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

const updateDateFilter = (key, type, value) => {
  const updatedFilters = [...props.dateFilters]
  const filterIndex = updatedFilters.findIndex(f => f.key === key)

  if (filterIndex >= 0) {
    updatedFilters[filterIndex] = {
      ...updatedFilters[filterIndex],
      [type]: value
    }
    emit('update:dateFilters', updatedFilters)
  }
}

// Computed Properties
const hasActiveFilters = computed(() => {
  const hasSearch = props.searchQuery
  const hasStatus = props.selectedStatus
  const hasLegacyDates = props.dateFrom || props.dateTo
  const hasDynamicDates = props.dateFilters.some(filter => filter.from || filter.to)

  return hasSearch || hasStatus || hasLegacyDates || hasDynamicDates
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (props.searchQuery) count++
  if (props.selectedStatus) count++
  if (props.dateFrom || props.dateTo) count++
  count += props.dateFilters.filter(f => f.from || f.to).length
  return count
})

const activeFiltersDisplay = computed(() => {
  const filters = []

  if (props.searchQuery && props.searchQuery.trim()) {
    filters.push({
      key: 'search',
      label: 'Search',
      value: `"${props.searchQuery}"`,
      icon: 'magnifying-glass'
    })
  }

  if (props.selectedStatus) {
    const statusOption = props.statusOptions.find(opt => opt.value === props.selectedStatus)
    filters.push({
      key: 'status',
      label: 'Status',
      value: statusOption?.label || props.selectedStatus,
      icon: 'filter'
    })
  }

  // Legacy date filter
  if (props.dateFrom || props.dateTo) {
    let dateValue = ''
    if (props.dateFrom && props.dateTo) {
      dateValue = `${props.dateFrom} to ${props.dateTo}`
    } else if (props.dateFrom) {
      dateValue = `From ${props.dateFrom}`
    } else if (props.dateTo) {
      dateValue = `Until ${props.dateTo}`
    }

    if (dateValue) {
      filters.push({
        key: 'date',
        label: 'Date Range',
        value: dateValue,
        icon: 'calendar'
      })
    }
  }

  // Dynamic date filters - only show those with values
  props.dateFilters.forEach(dateFilter => {
    if (dateFilter.from || dateFilter.to) {
      let dateValue = ''
      if (dateFilter.from && dateFilter.to) {
        dateValue = `${dateFilter.from} to ${dateFilter.to}`
      } else if (dateFilter.from) {
        dateValue = `From ${dateFilter.from}`
      } else if (dateFilter.to) {
        dateValue = `Until ${dateFilter.to}`
      }

      if (dateValue) {
        filters.push({
          key: `date-${dateFilter.key}`,
          label: dateFilter.label,
          value: dateValue,
          icon: 'calendar'
        })
      }
    }
  })

  return filters
})

// Computed Classes
const filtersClasses = computed(() =>
  cn(filtersVariants({
    variant: props.variant,
    padding: props.padding
  }))
)

const searchIconClasses = computed(() =>
  'absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors'
)

const searchInputClasses = computed(() =>
  cn(
    inputVariants({ size: 'md' }),
    'w-full pl-10 pr-10 hover:border-gray-300'
  )
)

const clearSearchButtonClasses = computed(() =>
  'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-all'
)

const selectClasses = computed(() =>
  cn(
    inputVariants({ size: 'md' }),
    'w-full pr-8 appearance-none hover:border-gray-300'
  )
)

const advancedFiltersToggleClasses = computed(() => {
  const isActive = showAdvancedFilters.value || hasActiveFilters.value
  return cn(
    buttonVariants({
      variant: isActive ? 'primary' : 'default',
      size: 'lg'
    }),
    'gap-2'
  )
})

const filterCountBadgeClasses = computed(() =>
  'bg-white text-blue-600 text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center font-semibold'
)

const advancedFiltersContainerClasses = computed(() =>
  'px-6 py-4 border-t border-gray-100 bg-gray-50'
)

const dateInputClasses = computed(() =>
  cn(inputVariants({ size: 'md' }), 'pl-10 pr-3')
)

const dateFilterLabelClasses = computed(() =>
  'text-sm font-semibold text-gray-700'
)

const dateRangeSeparatorClasses = computed(() =>
  'text-gray-500 text-sm font-medium'
)

const clearDateFilterButtonClasses = computed(() =>
  'text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-200 rounded-full transition-all'
)

const clearFiltersButtonClasses = computed(() =>
  cn(buttonVariants({ variant: 'ghost', size: 'md' }))
)

const exportButtonClasses = computed(() =>
  cn(buttonVariants({ variant: 'default', size: 'lg' }))
)

const activeFiltersContainerClasses = computed(() =>
  'px-6 py-3 bg-blue-50 border-t border-blue-100'
)

const activeFiltersLabelClasses = computed(() =>
  'text-sm font-semibold text-blue-800'
)

const activeFilterTagClasses = computed(() =>
  'flex items-center gap-1.5 bg-white border border-blue-200 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium'
)

const activeFilterRemoveButtonClasses = computed(() =>
  'text-blue-600 hover:text-blue-800 ml-1 hover:bg-blue-100 rounded-full p-0.5 transition-all'
)

// Methods
const clearFilters = () => {
  emit('update:searchQuery', '')
  emit('update:selectedStatus', '')
  emit('update:dateFrom', '')
  emit('update:dateTo', '')

  // Clear dynamic date filters
  const clearedDateFilters = props.dateFilters.map(filter => ({
    ...filter,
    from: '',
    to: ''
  }))
  emit('update:dateFilters', clearedDateFilters)

  emit('clear-filters')
}

const removeFilter = (filterKey) => {
  switch (filterKey) {
    case 'search':
      emit('update:searchQuery', '')
      break
    case 'status':
      emit('update:selectedStatus', '')
      break
    case 'date':
      emit('update:dateFrom', '')
      emit('update:dateTo', '')
      break
    default:
      // Handle dynamic date filters
      if (filterKey.startsWith('date-')) {
        const dateKey = filterKey.replace('date-', '')
        const updatedFilters = props.dateFilters.map(filter =>
          filter.key === dateKey
            ? { ...filter, from: '', to: '' }
            : filter
        )
        emit('update:dateFilters', updatedFilters)
      }
      break
  }
}
</script>


<template>
  <div class="bg-white border-b border-gray-200">
    <!-- Main Filters Bar -->
    <div :class="filtersClasses">
      <!-- Search Input -->
      <div v-if="showSearch" class="flex-1 min-w-80 max-w-md">
        <div class="relative group">
          <Icon icon="magnifying-glass" :class="searchIconClasses" />
          <input :model-value="searchQuery" :placeholder="searchPlaceholder" :class="searchInputClasses"
            @input="$emit('update:searchQuery', $event.target.value)">
          <button v-if="searchQuery" :class="clearSearchButtonClasses" @click="$emit('update:searchQuery', '')">
            <Icon icon="xmark" class="w-3 h-3" />
          </button>
        </div>
      </div>

      <!-- Status Filter -->
      <div v-if="showFilters && statusOptions.length > 0" class="min-w-36">
        <div class="relative">
          <Select :model-value="selectedStatus" :class="selectClasses"
            @change="$emit('update:selectedStatus', $event.target.value)">
            <option value="">
              All Status
            </option>
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </Select>
          <Icon icon="chevron-down"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <!-- Advanced Filters Toggle -->
      <button v-if="showFilters" :class="advancedFiltersToggleClasses" @click="toggleAdvancedFilters">
        <Icon icon="filter" class="w-4 h-4" />
        Filters
        <span v-if="activeFiltersCount > 0" :class="filterCountBadgeClasses">
          {{ activeFiltersCount }}
        </span>
        <Icon :icon="showAdvancedFilters ? 'chevron-up' : 'chevron-down'" class="w-4 h-4 ml-1" />
      </button>

      <!-- Custom Filters Slot -->
      <div v-if="$slots.filters" class="flex items-center gap-2">
        <slot name="filters" />
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 ml-auto">
        <!-- Clear Filters -->
        <Button v-if="hasActiveFilters" :class="clearFiltersButtonClasses" @click="clearFilters">
          <Icon icon="rotate-left" class="w-4 h-4 mr-2" />
          Clear All
        </Button>

        <!-- Export Button -->
        <Button v-if="showExport" :class="exportButtonClasses" @click="$emit('export')">
          <Icon icon="download" class="w-4 h-4 mr-2" />
          Export
        </Button>

        <!-- Add Button Slot -->
        <slot name="actions">
          <Button v-if="showAdd" variant="success" size="lg" @click="$emit('add')">
            <Icon icon="plus" class="w-4 h-4 mr-2" />
            Add
          </Button>
        </slot>
      </div>
    </div>

    <!-- Advanced Filters Panel -->
    <div v-if="showFilters && showAdvancedFilters && dateFilters.length > 0" :class="advancedFiltersContainerClasses">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div v-for="dateFilter in dateFilters" :key="dateFilter.key" class="space-y-3">
          <div class="flex items-center justify-between">
            <label :class="dateFilterLabelClasses">
              {{ dateFilter.label }}
            </label>
            <span :class="getDateFilterStatusClasses(dateFilter)">
              {{ hasDateFilterValues(dateFilter) ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="flex items-center gap-3">
            <div class="relative flex-1">
              <Icon icon="calendar" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="date" :model-value="dateFilter.from" :class="dateInputClasses"
                :placeholder="`From ${dateFilter.label}`"
                @input="updateDateFilter(dateFilter.key, 'from', $event.target.value)">
            </div>
            <span :class="dateRangeSeparatorClasses">to</span>
            <div class="relative flex-1">
              <Icon icon="calendar" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="date" :model-value="dateFilter.to" :class="dateInputClasses"
                :placeholder="`To ${dateFilter.label}`"
                @input="updateDateFilter(dateFilter.key, 'to', $event.target.value)">
            </div>
            <button v-if="hasDateFilterValues(dateFilter)" :class="clearDateFilterButtonClasses"
              title="Clear this filter" @click="clearDateFilter(dateFilter.key)">
              <Icon icon="xmark" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div v-if="showFilters && activeFiltersDisplay.length > 0" :class="activeFiltersContainerClasses">
      <div class="flex items-center gap-3 flex-wrap">
        <span :class="activeFiltersLabelClasses">Active filters:</span>
        <div v-for="filter in activeFiltersDisplay" :key="filter.key" :class="activeFilterTagClasses">
          <Icon :icon="filter.icon" class="w-3 h-3" />
          <span>{{ filter.label }}: {{ filter.value }}</span>
          <button :class="activeFilterRemoveButtonClasses" @click="removeFilter(filter.key)">
            <Icon icon="xmark" class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- Table Info Bar -->
    <div v-if="showTableInfo" class="px-6 py-3 bg-gray-50 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">
            <span class="font-medium">{{ totalItems || 0 }}</span>
            {{ itemLabel || 'items' }} found
          </span>
        </div>
      </div>
    </div>
  </div>
</template>