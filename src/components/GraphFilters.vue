<template>
  <div class=" border-b ">
    <!-- Main Filters Bar -->
    <div :class="filtersClasses">
      <!-- Date Range Filter -->
      <div
        v-if="showDateFilter"
        class="flex items-center gap-3 min-w-64"
      >
        <div class="relative flex-1">
          <Icon
            icon="calendar"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ui-text"
          />
          <input
            v-model="dateFrom"
            type="date"
            :class="dateInputClasses"
            placeholder="From date"
          >
        </div>
        <span class="ui-text text-sm">to</span>
        <div class="relative flex-1">
          <Icon
            icon="calendar"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ui-text"
          />
          <input
            v-model="dateTo"
            type="date"
            :class="dateInputClasses"
            placeholder="To date"
          >
        </div>
      </div>

      <!-- Chart Type Selector -->
      <div
        v-if="showChartTypeFilter"
        class="min-w-40"
      >
        <div class="relative">
          <Select
            v-model="selectedChartType"
            :class="selectClasses"
            @change="handleChartTypeChange"
          >
            <option value="bar">
              Bar Chart
            </option>
            <option value="line">
              Line Chart
            </option>
            <option value="pie">
              Pie Chart
            </option>
          </Select>
          <Icon
            icon="chart-bar"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 ui-text pointer-events-none"
          />
        </div>
      </div>

      <!-- Data Source Filter -->
      <div
        v-if="dataSources.length > 0"
        class="min-w-40"
      >
        <div class="relative">
          <Select
            v-model="selectedDataSource"
            :class="selectClasses"
            @change="handleDataSourceChange"
          >
            <option value="">
              All Sources
            </option>
            <option
              v-for="source in dataSources"
              :key="source.value"
              :value="source.value"
            >
              {{ source.label }}
            </option>
          </Select>
          <Icon
            icon="database"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 ui-text pointer-events-none"
          />
        </div>
      </div>

      <!-- Custom Filters Slot -->
      <div
        v-if="$slots.filters"
        class="flex items-center gap-2"
      >
        <slot name="filters" />
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 ml-auto">
        <!-- Clear Filters -->
        <Button
          v-if="hasActiveFilters"
          :class="clearFiltersButtonClasses"
          @click="clearFilters"
        >
          <Icon
            icon="rotate-left"
            class="w-4 h-4 mr-2"
          />
          Clear Filters
        </Button>

        <!-- Export Button -->
        <Button
          v-if="showExport"
          :class="exportButtonClasses"
          @click="$emit('export')"
        >
          <Icon
            icon="download"
            class="w-4 h-4 mr-2"
          />
          Export
        </Button>

        <!-- Refresh Button -->
        <Button
          v-if="showRefresh"
          :class="refreshButtonClasses"
          @click="$emit('refresh')"
        >
          <Icon
            icon="sync"
            class="w-4 h-4 mr-2"
          />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div
      v-if="activeFilters.length > 0"
      :class="activeFiltersContainerClasses"
    >
      <div class="flex items-center gap-3 flex-wrap">
        <span :class="activeFiltersLabelClasses">Active filters:</span>
        <div
          v-for="filter in activeFilters"
          :key="filter.key"
          :class="activeFilterTagClasses"
        >
          <Icon
            :icon="filter.icon"
            class="w-3 h-3"
          />
          <span>{{ filter.label }}: {{ filter.value }}</span>
          <button
            :class="activeFilterRemoveButtonClasses"
            @click="removeFilter(filter.key)"
          >
            <Icon
              icon="circle-xmark"
              class="w-3 h-3"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'
import Button from './Button.vue'
import Select from './Select.vue'
import Icon from './Icon.vue'

const props = defineProps({
    showDateFilter: {
        type: Boolean,
        default: true
    },
    showChartTypeFilter: {
        type: Boolean,
        default: true
    },
    showExport: {
        type: Boolean,
        default: false
    },
    showRefresh: {
        type: Boolean,
        default: true
    },
    dataSources: {
        type: Array,
        default: () => []
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
    'update:dateFrom',
    'update:dateTo',
    'update:chartType',
    'update:dataSource',
    'export',
    'refresh',
    'clear-filters'
])

// Local state
const dateFrom = ref('')
const dateTo = ref('')
const selectedChartType = ref('bar')
const selectedDataSource = ref('')

// CVA Variants
const filtersVariants = cva('flex flex-wrap items-center gap-4', {
    variants: {
        variant: {
            default: '',
            minimal: 'bg-transparent',
            bordered: ''
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

// Computed properties
const hasActiveFilters = computed(() => {
    return dateFrom.value || dateTo.value || selectedDataSource.value
})

const activeFilters = computed(() => {
    const filters = []

    if (dateFrom.value || dateTo.value) {
        let dateValue = ''
        if (dateFrom.value && dateTo.value) {
            dateValue = `${dateFrom.value} to ${dateTo.value}`
        } else if (dateFrom.value) {
            dateValue = `From ${dateFrom.value}`
        } else if (dateTo.value) {
            dateValue = `Until ${dateTo.value}`
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

    if (selectedDataSource.value) {
        const source = props.dataSources.find(s => s.value === selectedDataSource.value)
        filters.push({
            key: 'dataSource',
            label: 'Data Source',
            value: source?.label || selectedDataSource.value,
            icon: 'database'
        })
    }

    return filters
})

// Computed Classes
const filtersClasses = computed(() =>
    cn(filtersVariants({
        variant: props.variant,
        padding: props.padding
    }))
)

const dateInputClasses = computed(() =>
    'w-full pl-10 pr-3 py-2 border ui-border-strong  rounded-lg focus:outline-none focus:ring-2 focus:ring-(--ui-primary) focus:border-transparent text-sm ui-surface '
)

const selectClasses = computed(() =>
    'w-full pr-8 appearance-none border ui-border-strong  rounded-lg focus:outline-none focus:ring-2 focus:ring-(--ui-primary) focus:border-transparent text-sm py-2 pl-3 ui-surface '
)

const clearFiltersButtonClasses = computed(() =>
    'ui-text hover:text-(--ui-text) border   hover:brightness-105 px-3 py-2 rounded-lg text-sm font-medium transition-all'
)

const exportButtonClasses = computed(() =>
    'ui-text ui-primary-bg hover:bg-(--ui-primary-strong) border border-(--ui-primary)  px-3 py-2 rounded-lg text-sm font-medium transition-all'
)

const refreshButtonClasses = computed(() =>
    'ui-text hover:text-(--ui-text) border   hover:brightness-105 px-3 py-2 rounded-lg text-sm font-medium transition-all'
)

const activeFiltersContainerClasses = computed(() =>
    'px-6 py-3 ui-primary-soft border-t border-(--ui-primary-soft)'
)

const activeFiltersLabelClasses = computed(() =>
    'text-sm font-semibold ui-primary'
)

const activeFilterTagClasses = computed(() =>
    'flex items-center gap-1.5 ui-surface border border-(--ui-primary-soft) ui-primary px-3 py-1.5 rounded-full text-sm font-medium'
)

const activeFilterRemoveButtonClasses = computed(() =>
    'ui-primary hover:text-(--ui-primary) ml-1 hover:bg-(--ui-primary-soft) rounded-full p-0.5 transition-all'
)

// Methods
const handleChartTypeChange = (event) => {
    selectedChartType.value = event.target.value
    emit('update:chartType', event.target.value)
}

const handleDataSourceChange = (event) => {
    selectedDataSource.value = event.target.value
    emit('update:dataSource', event.target.value)
}

const clearFilters = () => {
    dateFrom.value = ''
    dateTo.value = ''
    selectedDataSource.value = ''
    emit('clear-filters')
}

const removeFilter = (filterKey) => {
    switch (filterKey) {
        case 'date':
            dateFrom.value = ''
            dateTo.value = ''
            break
        case 'dataSource':
            selectedDataSource.value = ''
            break
    }
}

// Watch for external changes
watch(() => dateFrom.value, (newValue) => {
    emit('update:dateFrom', newValue)
})

watch(() => dateTo.value, (newValue) => {
    emit('update:dateTo', newValue)
})
</script>
