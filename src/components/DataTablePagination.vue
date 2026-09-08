<template>
  <div
    v-if="showPagination || $slots.footer"
    :class="footerClasses"
  >
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <!-- Selection Info -->
      <div
        v-if="selectable && selectedCount > 0"
        class="text-sm ui-text text-center lg:text-left"
      >
        {{ selectedCount }} of {{ total }} selected
      </div>
      <div
        v-else
        class="text-sm ui-text text-center lg:text-left"
      >
        Showing {{ startItem }} to {{ endItem }} of {{ total }} entries
      </div>

      <!-- Custom Footer Slot -->
      <div
        v-if="$slots.footer"
        class="flex items-center justify-center gap-4 lg:justify-start"
      >
        <slot name="footer" />
      </div>

      <!-- Pagination Controls -->
      <div
        v-if="showPagination"
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:w-auto lg:justify-end"
      >
        <!-- Page Size Selector -->
        <div class="flex items-center justify-center gap-2 sm:justify-start">
          <Label
            for="pageSize"
            :class="labelClasses"
            :inline="true"
          >Show:</Label>
          <Select
            id="pageSize"
            :model-value="pageSize.toString()"
            :class="selectClasses"
            @update:model-value="val => $emit('update:pageSize', parseInt(val))"
          >
            <Option
              v-for="size in pageSizeOptions"
              :key="size"
              :value="size.toString()"
              :label="size.toString()"
            />
          </Select>
        </div>

        <!-- Page Navigation -->
        <div class="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
          <!-- First Page -->
          <button
            :disabled="currentPage === 1"
            :class="[getPageButtonClasses(false, currentPage === 1), 'hidden sm:inline-flex']"
            title="First page"
            @click="$emit('update:currentPage', 1)"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"
              />
            </svg>
          </button>

          <!-- Previous Page -->
          <button
            :disabled="currentPage === 1"
            :class="getPageButtonClasses(false, currentPage === 1)"
            title="Previous page"
            @click="$emit('update:currentPage', currentPage - 1)"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          <!-- Page Numbers -->
          <div class="hidden md:flex items-center gap-1 ui-border-strong">
            <button
              v-for="page in visiblePages"
              :key="page"
              :class="getPageButtonClasses(page === currentPage, false)"
              @click="$emit('update:currentPage', page)"
            >
              {{ page }}
            </button>
          </div>

          <!-- Next Page -->
          <button
            :disabled="currentPage === totalPages"
            :class="getPageButtonClasses(false, currentPage === totalPages)"
            title="Next page"
            @click="$emit('update:currentPage', currentPage + 1)"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>

          <!-- Last Page -->
          <button
            :disabled="currentPage === totalPages"
            :class="[getPageButtonClasses(false, currentPage === totalPages), 'hidden sm:inline-flex']"
            title="Last page"
            @click="$emit('update:currentPage', totalPages)"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>

        <!-- Page Info -->
        <div class="text-sm ui-text text-center sm:text-left sm:ml-2">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Label from './Label.vue'
import Option from './Option.vue'
import Select from './Select.vue'
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    required: true
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  selectable: {
    type: Boolean,
    default: false
  },
  selectedCount: {
    type: Number,
    default: 0
  },
  pageSizeOptions: {
    type: Array,
    default: () => [5, 10, 25, 50, 100]
  },
  maxVisiblePages: {
    type: Number,
    default: 7
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

defineEmits(['update:currentPage', 'update:pageSize'])

// CVA variants
const footerVariants = cva('border ui-border-strong rounded-2xl', {
  variants: {
    variant: {
      default: 'bg-(--ui-bg) ',
      minimal: 'bg-transparent ui-border-strong ',
      bordered: 'bg-(--ui-bg) border-2 ui-border-strong '
    },
    padding: {
      compact: 'px-4 py-2',
      normal: 'px-6 py-4',
      comfortable: 'px-8 py-6'
    }
  },
  defaultVariants: {
    variant: 'default',
    padding: 'normal'
  }
})

const pageButtonVariants = cva('text-sm font-medium border rounded-md transition-colors duration-200', {
  variants: {
    state: {
      active: 'ui-text border-(--ui-border-strong) bg-(--ui-primary-soft) ui-primary',
      inactive: 'bg-(--ui-bg)  ui-text ui-border-strong  hover:text-(--ui-text)',
      disabled: 'bg-(--ui-bg)  ui-text ui-border-strong  cursor-not-allowed'
    },
    size: {
      sm: 'px-2 py-1',
      md: 'px-3 py-2',
      lg: 'px-4 py-3'
    }
  },
  defaultVariants: {
    state: 'inactive',
    size: 'md'
  }
})

const labelVariants = cva('ui-text', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    }
  },
  defaultVariants: {
    size: 'md'
  }
})

const selectVariants = cva('border ui-border-strong  rounded-md focus:outline-none focus:ring-2 focus:ring-(--ui-primary) text-sm min-w-[60px] focus:border-transparent', {
  variants: {
    size: {
      sm: 'px-2 py-1',
      md: 'px-3 py-2',
      lg: 'px-4 py-3'
    }
  },
  defaultVariants: {
    size: 'sm'
  }
})

// Computed properties
const startItem = computed(() => {
  return (props.currentPage - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.pageSize, props.total)
})

const visiblePages = computed(() => {
  const pages = []
  const total = props.totalPages
  const current = props.currentPage
  const maxVisible = props.maxVisiblePages

  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    const halfVisible = Math.floor(maxVisible / 2)
    let start = Math.max(1, current - halfVisible)
    let end = Math.min(total, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }

  return pages
})

// Computed classes using CVA
const footerClasses = computed(() => 
  cn(footerVariants({ 
    variant: props.variant, 
    padding: props.padding 
  }))
)

const labelClasses = computed(() => 
  cn(labelVariants({ size: 'md' }))
)

const selectClasses = computed(() => 
  cn(selectVariants({ size: 'sm' }))
)

const getPageButtonClasses = (isActive, isDisabled) => {
  let state = 'inactive'
  if (isDisabled) state = 'disabled'
  else if (isActive) state = 'active'
  
  return cn(pageButtonVariants({ 
    state, 
    size: 'md' 
  }))
}
</script>
