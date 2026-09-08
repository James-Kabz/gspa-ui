<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import Badge from './Badge.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  options: {
    type: Array,
    required: true,
    validator: (options) => options.every(option => option.value !== undefined && option.label)
  },
  id: {
    type: String,
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Select options'
  },
  hasError: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref(null)
const filteredOptions = ref([...props.options])
const buttonRef = ref(null)
const dropdownRef = ref(null)
const dropdownStyle = ref({})

const VIEWPORT_PADDING = 12
const DROPDOWN_GAP = 4
const MAX_DROPDOWN_HEIGHT = 320
const DROPDOWN_MIN_HEIGHT = 180
const DROPDOWN_Z_INDEX = 10050

const selectedLabels = computed(() => {
  return props.options
    .filter(option => props.modelValue.includes(option.value))
    .map(option => option.label)
})

const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
  filteredOptions.value = [...props.options]
}

const updateDropdownPosition = () => {
  if (!buttonRef.value || !isOpen.value) return

  const rect = buttonRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const availableBelow = Math.max(0, viewportHeight - rect.bottom - DROPDOWN_GAP - VIEWPORT_PADDING)
  const availableAbove = Math.max(0, rect.top - DROPDOWN_GAP - VIEWPORT_PADDING)
  const openAbove = availableAbove > availableBelow
  const availableHeight = openAbove ? availableAbove : availableBelow
  const maxHeight = Math.max(
    Math.min(MAX_DROPDOWN_HEIGHT, availableHeight),
    Math.min(DROPDOWN_MIN_HEIGHT, MAX_DROPDOWN_HEIGHT)
  )

  const maxWidth = Math.max(0, viewportWidth - VIEWPORT_PADDING * 2)
  const width = Math.min(rect.width, maxWidth)
  let left = rect.left

  if (left + width > viewportWidth - VIEWPORT_PADDING) {
    left = viewportWidth - VIEWPORT_PADDING - width
  }
  if (left < VIEWPORT_PADDING) {
    left = VIEWPORT_PADDING
  }

  dropdownStyle.value = {
    position: 'fixed',
    left: `${left}px`,
    width: `${width}px`,
    maxHeight: `${maxHeight}px`,
    zIndex: DROPDOWN_Z_INDEX,
    ...(openAbove
      ? { bottom: `${viewportHeight - rect.top + DROPDOWN_GAP}px` }
      : { top: `${rect.bottom + DROPDOWN_GAP}px` })
  }
}

const toggleDropdown = () => {
  if (!props.disabled) {
    if (isOpen.value) {
      closeDropdown()
    } else {
      isOpen.value = true
      nextTick(() => {
        updateDropdownPosition()
        searchInput.value?.focus()
      })
    }
  }
}

const toggleOption = (value) => {
  let newValue
  if (props.modelValue.includes(value)) {
    newValue = props.modelValue.filter(v => v !== value)
  } else {
    newValue = [...props.modelValue, value]
  }
  emit('update:modelValue', newValue)
  nextTick(() => {
    updateDropdownPosition()
  })
}

const filterOptions = () => {
  if (!searchQuery.value.trim()) {
    filteredOptions.value = [...props.options]
  } else {
    const query = searchQuery.value.toLowerCase()
    filteredOptions.value = props.options.filter(option =>
      option.label.toLowerCase().includes(query)
    )
  }
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    closeDropdown()
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!buttonRef.value) return
  const target = event.target

  if (!target) return

  const isInsideDropdown = dropdownRef.value && dropdownRef.value.contains(target)
  const isInsideButton = buttonRef.value.contains(target)

  if (!isInsideDropdown && !isInsideButton) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', updateDropdownPosition, true)
  window.addEventListener('resize', updateDropdownPosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', updateDropdownPosition, true)
  window.removeEventListener('resize', updateDropdownPosition)
})

// Watch for options changes
watch(() => props.options, (newOptions) => {
  filteredOptions.value = [...newOptions]
}, { immediate: true })

watch(() => props.modelValue, () => {
  if (isOpen.value) {
    nextTick(() => {
      updateDropdownPosition()
    })
  }
})

watch(filteredOptions, () => {
  if (isOpen.value) {
    nextTick(() => {
      updateDropdownPosition()
    })
  }
})

watch(isOpen, (open) => {
  if (open) {
    updateDropdownPosition()
  }
})
</script>

<template>
  <div class="relative">
    <button
      :id="id"
      ref="buttonRef"
      type="button"
      :disabled="disabled"
      :class="[
        'w-full px-3 py-2.5 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-(--ui-primary) ui-surface  min-h-[42px]',
        hasError ? 'border-(--ui-danger)' : 'ui-border-strong ',
        disabled ? 'ui-surface-muted cursor-not-allowed opacity-50' : 'hover:border-(--ui-border-strong)'
      ]"
      @click="toggleDropdown"
      @keydown="handleKeydown"
    >
      <div
        v-if="selectedLabels.length === 0"
        class="ui-text-muted"
      >
        {{ placeholder || 'Select options' }}
      </div>
      <div
        v-else
        class="flex flex-wrap gap-1.5"
      >
        <Badge
          v-for="label in selectedLabels"
          :key="label"
          variant="primary"
          size="sm"
        >
          {{ label }}
        </Badge>
      </div>
      <svg
        class="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 ui-text pointer-events-none transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          ref="dropdownRef"
          :style="dropdownStyle"
          data-multiselect-dropdown
          class="shadow-lg rounded-md text-base ring-1 ring-(--ui-border-strong) ring-opacity-5 overflow-hidden focus:outline-none ui-surface flex flex-col overscroll-contain"
        >
          <!-- Search input -->
          <div class="px-3 py-2.5 border-b ui-border-strong  ui-surface-muted">
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Search options..."
              class="w-full px-3 py-2 text-sm border ui-border-strong  rounded-md focus:outline-none focus:ring-2 focus:ring-(--ui-primary) focus:border-transparent ui-surface placeholder:text-(--ui-text-muted)"
              @input="filterOptions"
              @keydown.stop
            >
          </div>

          <!-- Options list -->
          <div
            v-if="filteredOptions.length > 0"
            class="overflow-y-auto py-1 flex-1 overscroll-contain"
            @wheel.stop
          >
            <button
              v-for="option in filteredOptions"
              :key="option.value"
              type="button"
              class="cursor-pointer select-none relative py-2.5 pl-3 pr-9 w-full text-left hover:bg-(--ui-primary-soft) focus:bg-(--ui-primary-soft) focus:outline-none transition-colors duration-150"
              :class="{ 'ui-primary-soft': modelValue.includes(option.value) }"
              @click="toggleOption(option.value)"
            >
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  :checked="modelValue.includes(option.value)"
                  class="h-4 w-4 ui-primary focus:ring-(--ui-primary) ui-border-strong  rounded cursor-pointer pointer-events-none"
                  readonly
                  tabindex="-1"
                >
                <span
                  class="block font-normal truncate"
                  :class="{ 'ui-primary font-medium': modelValue.includes(option.value) }"
                >
                  {{ option.label }}
                </span>
              </div>
            </button>
          </div>

          <!-- No results -->
          <div
            v-else
            class="px-4 py-6 text-sm ui-text text-center"
          >
            No options found
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
