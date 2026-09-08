<script setup>
import { ref, computed, watch, nextTick, onUnmounted, onMounted } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: null
  },
  hasError: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: null
  },
  name: {
    type: String,
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  allowCreate: {
    type: Boolean,
    default: false
  },
  class: String
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref(null)
const buttonRef = ref(null)
const dropdownRef = ref(null)
const filteredOptions = ref([...props.options])
const dropdownStyle = ref({})
const VIEWPORT_PADDING = 12
const DROPDOWN_GAP = 4
const MAX_DROPDOWN_HEIGHT = 320
const DROPDOWN_MIN_HEIGHT = 180
const DROPDOWN_Z_INDEX = 10050

const selectedOption = computed(() => {
  return props.options.find(option => option.value === props.modelValue)
})

const selectVariants = cva(
  'border ui-border-strong  rounded-md focus:outline-none focus:ring-2 focus:ring-(--ui-primary) text-sm min-w-[60px] focus:border-transparent ',
  {
    variants: {
      disabled: {
        true: 'ui-surface-muted cursor-not-allowed opacity-50',
        false: 'ui-surface hover:border-(--ui-border-strong)'
      }
    }
  }
)

const selectClasses = computed(() =>
  cn(
    selectVariants({ disabled: props.disabled }),
    'px-3 py-2',
    props.class
  )
)

const selectButtonClasses = computed(() =>
  cn(
    'w-full px-3 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-(--ui-primary) ui-surface  ',
    props.hasError ? 'border-(--ui-danger)' : 'ui-border',
    props.disabled ? 'ui-surface-muted cursor-not-allowed opacity-50' : 'hover:border-(--ui-border-strong)',
    props.class
  )
)

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
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      updateDropdownPosition()
      nextTick(() => {
        searchInput.value?.focus()
      })
    }
  }
}

const selectOption = (value) => {
  emit('update:modelValue', value)
  isOpen.value = false
  searchQuery.value = ''
  filteredOptions.value = [...props.options]
}

const createOption = (event) => {
  // Prevent event propagation
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }
  
  if (props.allowCreate && searchQuery.value.trim()) {
    const newValue = searchQuery.value.trim()
    emit('update:modelValue', newValue)
    isOpen.value = false
    searchQuery.value = ''
    filteredOptions.value = [...props.options]
  }
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
    isOpen.value = false
    searchQuery.value = ''
    filteredOptions.value = [...props.options]
  } else if (event.key === 'Enter' && props.allowCreate && searchQuery.value.trim() && filteredOptions.value.length === 0) {
    event.preventDefault()
    createOption(event)
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!buttonRef.value) return
  const target = event.target
  
  // Check if click is inside dropdown or button
  const isInsideDropdown = dropdownRef.value && dropdownRef.value.contains(target)
  const isInsideButton = buttonRef.value.contains(target)
  
  if (!isInsideDropdown && !isInsideButton) {
    isOpen.value = false
    searchQuery.value = ''
    filteredOptions.value = [...props.options]
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

watch(isOpen, (open) => {
  if (open) {
    updateDropdownPosition()
  }
})
</script>


<template>
  <!-- Native select when no options provided -->
  <select
    v-if="!options || options.length === 0"
    :id="id"
    :name="name"
    :value="modelValue"
    :disabled="disabled"
    :required="required"
    :class="selectClasses"
    v-bind="$attrs"
    @change="$emit('update:modelValue', $event.target.value)"
  >
    <slot />
  </select>

  <!-- Searchable dropdown when options provided -->
  <div
    v-else
    class="relative"
  >
    <button
      :id="id"
      ref="buttonRef"
      type="button"
      :disabled="disabled"
      :class="selectButtonClasses"
      @click="toggleDropdown"
      @keydown="handleKeydown"
    >
      <div
        v-if="!selectedOption"
        class="ui-text-muted"
      >
        {{ placeholder || 'Select an option' }}
      </div>
      <div
        v-else
        class="ui-text"
      >
        {{ selectedOption.label }}
      </div>
      <svg
        class="absolute right-2 top-2.5 h-5 w-5 ui-text"
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
      <div
        v-if="isOpen"
        ref="dropdownRef"
        :style="dropdownStyle"
        data-select-dropdown
        class="ui-surface border ui-border-strong shadow-lg rounded-md py-1 text-base overflow-hidden focus:outline-none flex flex-col overscroll-contain"
      >
        <!-- Search input -->
        <div class="px-3 py-2 border-b ui-border">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Search options..."
            class="w-full px-2 py-1 text-sm border ui-border-strong  rounded focus:outline-none focus:ring-1 focus:ring-(--ui-primary) ui-surface placeholder:text-(--ui-text-muted)"
            @input="filterOptions"
            @keydown="handleKeydown"
            @keydown.enter.prevent="handleKeydown"
          >
        </div>

        <!-- Options list -->
        <div
          v-if="filteredOptions.length > 0"
          class="overflow-y-auto flex-1 overscroll-contain"
          @wheel.stop
        >
          <button
            v-for="option in filteredOptions"
            :key="option.value"
            type="button"
            class="cursor-pointer select-none relative py-2 pl-3 pr-9 w-full text-left hover:bg-(--ui-primary-soft) focus:bg-(--ui-primary-soft) focus:outline-none transition-colors duration-150"
            :class="{ 'ui-primary-soft ui-primary': modelValue === option.value }"
            @click.stop="selectOption(option.value)"
          >
            <span class="block font-normal truncate">{{ option.label }}</span>
            <span
              v-if="modelValue === option.value"
              class="absolute inset-y-0 right-0 flex items-center pr-4 ui-primary"
            >
              <svg
                class="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          </button>
        </div>

        <!-- No results -->
        <div
          v-else-if="!props.allowCreate"
          class="px-4 py-3 text-sm ui-text text-center"
        >
          No options found
        </div>
        <div
          v-else
          class="px-4 py-3"
        >
          <button
            type="button"
            class="w-full text-left px-2 py-1 text-sm ui-primary hover:bg-(--ui-primary-soft) rounded cursor-pointer transition-colors"
            @click.stop="createOption"
            @mousedown.prevent
          >
            Create "{{ searchQuery }}"
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
