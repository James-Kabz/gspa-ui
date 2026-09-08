<template>
  <div
    ref="searchRef"
    class="relative"
  >
    <!-- Input -->
    <div class="relative">
      <!-- Left Icon -->
      <div class="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <SearchIcon :class="iconClasses" />
      </div>

      <!-- Search Input -->
      <input
        ref="inputRef"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      >

      <!-- Right Actions -->
      <div
        v-if="modelValue || loading"
        class="absolute right-3 top-1/2 transform -translate-y-1/2"
      >
        <!-- Clear -->
        <button
          v-if="!loading && clearable"
          class="ui-text hover:text-(--ui-text) transition-colors p-1 rounded-full hover:bg-(--ui-surface)"
          :aria-label="clearLabel"
          @click="handleClear"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>

        <!-- Loading -->
        <div
          v-else-if="loading"
          class="animate-spin"
        >
          <LoadingIcon class="w-4 h-4 ui-text" />
        </div>
      </div>
    </div>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 scale-95 translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-1"
    >
      <div
        v-if="showResults && (results.length > 0 || showNoResults)"
        :class="resultsClasses"
      >
        <!-- Results -->
        <div
          v-if="results.length > 0"
          class="max-h-64 overflow-y-auto"
        >
          <button
            v-for="(result, index) in results"
            :key="result.id || index"
            :class="getResultClasses(index)"
            @click="selectResult(result, index)"
            @mouseenter="focusedIndex = index"
          >
            <component
              :is="result.icon"
              v-if="result.icon"
              class="w-4 h-4 mr-3 shrink-0"
            />

            <div class="flex-1 text-left">
              <div
                class="font-medium ui-text"
              >
                {{ highlightMatch(result.title) }}
              </div>
              <div
                v-if="result.description"
                class="text-sm ui-text truncate"
              >
                {{ highlightMatch(result.description) }}
              </div>
            </div>

            <div
              v-if="result.category"
              class="text-xs ui-text ml-3"
            >
              {{ result.category }}
            </div>
          </button>
        </div>

        <!-- No Results -->
        <div
          v-else-if="showNoResults"
          class="px-4 py-3 text-sm ui-text text-center"
        >
          {{ noResultsText }}
        </div>

        <!-- Footer Slot -->
        <div
          v-if="$slots.footer"
          class="border-t ui-border-strong  p-2"
        >
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, h } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

// Icons
const SearchIcon = {
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
        d: 'm21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
      })
    ])
  }
}
const XMarkIcon = {
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
        d: 'M6 18 18 6M6 6l12 12'
      })
    ])
  }
}
const LoadingIcon = {
  render() {
    return h('svg', {
      fill: 'none',
      viewBox: '0 0 24 24',
      class: 'animate-spin'
    }, [
      h('circle', {
        class: 'opacity-25',
        cx: '12',
        cy: '12',
        r: '10',
        stroke: 'currentColor',
        'stroke-width': '4'
      }),
      h('path', {
        class: 'opacity-75',
        fill: 'currentColor',
        d: 'm4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
      })
    ])
  }
}

const props = defineProps({
  modelValue: { type: String, default: '' },
  results: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Search...' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true },
  clearLabel: { type: String, default: 'Clear search' },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  debounce: { type: Number, default: 300 },
  minLength: { type: Number, default: 1 },
  showNoResults: { type: Boolean, default: true },
  noResultsText: { type: String, default: 'No results found' },
  highlightMatches: { type: Boolean, default: true }
})

const emit = defineEmits([
  'update:modelValue',
  'search',
  'select',
  'clear',
  'focus',
  'blur'
])

// State
const searchRef = ref(null)
const inputRef = ref(null)
const showResults = ref(false)
const focusedIndex = ref(-1)
const debounceTimer = ref(null)

// Handlers
const handleInput = (e) => {
  const value = e.target.value
  emit('update:modelValue', value)

  if (debounceTimer.value) clearTimeout(debounceTimer.value)

  debounceTimer.value = setTimeout(() => {
    if (value.length >= props.minLength) {
      emit('search', value)
      showResults.value = true
    } else {
      showResults.value = false
    }
  }, props.debounce)
}
const handleFocus = (e) => {
  emit('focus', e)
  if (props.modelValue.length >= props.minLength) showResults.value = true
}
const handleBlur = (e) => {
  emit('blur', e)
  setTimeout(() => {
    showResults.value = false
    focusedIndex.value = -1
  }, 150)
}
const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  showResults.value = false
  inputRef.value?.focus()
}
const selectResult = (result) => {
  emit('select', result)
  showResults.value = false
  focusedIndex.value = -1
}
const handleKeydown = (e) => {
  if (!showResults.value || props.results.length === 0) return
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      focusedIndex.value = Math.min(focusedIndex.value + 1, props.results.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      focusedIndex.value = Math.max(focusedIndex.value - 1, -1)
      break
    case 'Enter':
      e.preventDefault()
      if (focusedIndex.value >= 0) selectResult(props.results[focusedIndex.value])
      break
    case 'Escape':
      e.preventDefault()
      showResults.value = false
      focusedIndex.value = -1
      break
  }
}

// Helpers
const highlightMatch = (text) => {
  if (!props.highlightMatches || !props.modelValue || !text) return text
  const regex = new RegExp(`(${props.modelValue})`, 'gi')
  return text.replace(regex, '$1')
}

// Variants
const inputVariants = cva(
  'block w-full rounded-lg border ui-surface  transition-colors duration-200 placeholder:text-(--ui-text) disabled:bg-(--ui-surface) disabled:text-(--ui-text) disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-(--ui-primary) focus:border-(--ui-primary)',
  {
    variants: {
      size: {
        sm: 'px-9 py-1.5 text-sm',
        md: 'px-10 py-2 text-sm',
        lg: 'px-12 py-3 text-base'
      }
    },
    defaultVariants: { size: 'md' }
  }
)

const iconVariants = cva('ui-text', {
  variants: {
    size: {
      sm: 'w-4 h-4',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    }
  },
  defaultVariants: { size: 'md' }
})

const inputClasses = computed(() => cn(inputVariants({ size: props.size })))
const iconClasses = computed(() => cn(iconVariants({ size: props.size })))
const resultsClasses = computed(() =>
  cn('absolute z-50 w-full mt-1 ui-surface  rounded-lg shadow-lg border ui-border-strong  max-h-96 overflow-hidden')
)
const getResultClasses = (i) =>
  cn(
    'flex items-center w-full px-4 py-3 text-left transition-colors duration-150 hover:bg-(--ui-surface) focus:bg-(--ui-surface) focus:outline-none',
    { 'ui-surface-muted': focusedIndex.value === i }
  )

// Outside click
const handleClickOutside = (e) => {
  if (searchRef.value && !searchRef.value.contains(e.target)) {
    showResults.value = false
    focusedIndex.value = -1
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (debounceTimer.value) clearTimeout(debounceTimer.value)
})
watch(() => props.results, () => (focusedIndex.value = -1))
</script>
