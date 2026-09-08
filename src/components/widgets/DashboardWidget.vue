<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Icon from '../Icon.vue'
import Loader from '../Loader.vue'
import BarChart from '../charts/BarChart.vue'
import LineChart from '../charts/LineChart.vue'
import PieChart from '../charts/PieChart.vue'
import { cn } from '../../utils/cn'

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  icon: { type: String, default: null },
  requiredRoles: { type: Function, default: null },
  loading: { type: Boolean, default: false },
  height: { type: String, default: 'auto' },
  maxHeight: { type: String, default: 'none' },
  minHeight: { type: String, default: '200px' },
  width: { type: String, default: '100%' },
  showRefresh: { type: Boolean, default: true },
  showHeader: { type: Boolean, default: true },
  padding: { type: String, default: 'normal' },
  hasRole: {
    type: Function,
    default: () => () => false
  },
  chartType: { type: String, default: null },
  chartData: { type: Object, default: null },
  chartOptions: { type: Object, default: () => ({}) },
  customizationOptions: { 
    type: Array, 
    default: () => []
  }
})

const emit = defineEmits(['refresh', 'dragstart', 'dragend', 'customize', 'keypress'])

const canView = computed(() => {
  if (!props.requiredRoles) return true
  return props.requiredRoles(props.hasRole)
})

const containerStyles = computed(() => ({
  width: props.width,
  height: props.height !== 'auto' ? props.height : undefined,
  maxHeight: props.maxHeight !== 'none' ? props.maxHeight : undefined,
  minHeight: props.minHeight
}))

const paddingClasses = {
  none: '',
  small: 'p-3',
  normal: 'p-4',
  large: 'p-6'
}

const showCustomization = ref(false)
const customSettings = ref({})

onMounted(() => {
  props.customizationOptions.forEach(option => {
    customSettings.value[option.id] = option.default ?? true
  })
})

const toggleCustomization = () => {
  showCustomization.value = !showCustomization.value
}

const updateSetting = (optionId, value) => {
  customSettings.value[optionId] = value
  emit('customize', { ...customSettings.value })
}

const widgetRef = ref(null)
const isFocused = ref(false)

const handleKeyDown = (e) => {
  if (!isFocused.value) return
  
  const handlers = {
    'r': () => emit('refresh'),
    'R': () => emit('refresh'),
    'c': () => toggleCustomization(),
    'C': () => toggleCustomization(),
    'Escape': () => showCustomization.value = false,
    'h': () => showKeyboardHelp.value = !showKeyboardHelp.value,
    'H': () => showKeyboardHelp.value = !showKeyboardHelp.value,
    '?': () => showKeyboardHelp.value = !showKeyboardHelp.value
  }

  if (handlers[e.key]) {
    e.preventDefault()
    handlers[e.key]()
    emit('keypress', e.key)
  }
}

const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = () => {
  isFocused.value = false
}

const showKeyboardHelp = ref(false)
const keyboardShortcuts = [
  { key: 'R', description: 'Refresh widget' },
  { key: 'C', description: 'Open customization' },
  { key: 'Esc', description: 'Close panels' },
  { key: '?', description: 'Toggle help' }
]

const isDragging = ref(false)
let dragClone = null

const handleDragStart = (e) => {
  if (!e.dataTransfer) return
  isDragging.value = true
  emit('dragstart', props.id)

  const rect = e.target.getBoundingClientRect()
  dragClone = e.target.cloneNode(true)
  Object.assign(dragClone.style, {
    position: 'fixed',
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    pointerEvents: 'none',
    opacity: '0.8',
    zIndex: '1000',
    left: `${e.clientX - rect.width / 2}px`,
    top: `${e.clientY - rect.height / 2}px`
  })
  document.body.appendChild(dragClone)

  e.dataTransfer.setDragImage(dragClone, rect.width / 2, rect.height / 2)
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', props.id)
}

const handleDrag = (e) => {
  if (dragClone && e.clientX && e.clientY) {
    dragClone.style.left = `${e.clientX - dragClone.offsetWidth / 2}px`
    dragClone.style.top = `${e.clientY - dragClone.offsetHeight / 2}px`
  }
}

const handleDragEnd = () => {
  isDragging.value = false
  emit('dragend', props.id)
  if (dragClone) {
    document.body.removeChild(dragClone)
    dragClone = null
  }
}

const chartComponentProps = computed(() => {
  if (!props.chartType || !props.chartData) return null

  const rawData = props.chartData.datasets?.[0]?.data || props.chartData.data || []
  const chartLabels = props.chartData.labels || []
  
  const validData = rawData.filter(val => val != null && !isNaN(val))
  if (validData.length === 0) return null

  // Calculate appropriate dimensions based on container
  const isPieOrDoughnut = props.chartType === 'pie' || props.chartType === 'doughnut'
  const chartWidth = isPieOrDoughnut ? 450 : 400
  const chartHeight = isPieOrDoughnut ? 450 : 400

  const baseProps = {
    data: validData,
    labels: chartLabels.slice(0, validData.length),
    width: chartWidth,
    height: chartHeight,
    seriesLabel: props.chartData.datasets?.[0]?.label || props.title,
    ...props.chartOptions
  }

  if (customSettings.value.legend !== undefined) {
    baseProps.showLegend = customSettings.value.legend
  }
  if (customSettings.value.grid !== undefined) {
    baseProps.showGrid = customSettings.value.grid
  }
  if (customSettings.value.values !== undefined) {
    baseProps.showValues = customSettings.value.values
  }
  if (customSettings.value.percentages !== undefined) {
    baseProps.showPercentages = customSettings.value.percentages
  }
  if (customSettings.value.points !== undefined) {
    baseProps.showPoints = customSettings.value.points
  }
  if (customSettings.value.fillArea !== undefined) {
    baseProps.fillArea = customSettings.value.fillArea
  }

  if (props.chartData.datasets?.[0]?.backgroundColor) {
    const bgColors = props.chartData.datasets[0].backgroundColor
    baseProps.colors = Array.isArray(bgColors) ? bgColors : [bgColors]
  }
  if (props.chartData.datasets?.[0]?.borderColor) {
    baseProps.lineColor = props.chartData.datasets[0].borderColor
  }

  return baseProps
})

const chartComponent = computed(() => {
  switch (props.chartType) {
    case 'bar':
      return BarChart
    case 'line':
      return LineChart
    case 'pie':
      return PieChart
    case 'doughnut':
      return PieChart
    default:
      return null
  }
})

const isDoughnut = computed(() => props.chartType === 'doughnut')

onMounted(() => {
  window.addEventListener('dragover', handleDrag)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('dragover', handleDrag)
  window.removeEventListener('keydown', handleKeyDown)
  if (dragClone) document.body.removeChild(dragClone)
})
</script>

<template>
  <div
    v-if="canView"
    ref="widgetRef"
    draggable="true"
    tabindex="0"
    :style="containerStyles"
    :class="cn(
      ' rounded-xl border ui-border-strong overflow-hidden transition-all select-none flex flex-col relative',
      'shadow-sm',
      isDragging ? 'opacity-50 scale-95' : 'hover:shadow-lg cursor-move',
      isFocused ? 'ring-2 ring-(--ui-primary) ring-offset-2' : ''
    )"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <div
      v-if="showHeader"
      class="flex bg-(--ui-surface)  items-center justify-between px-6 py-4 border-b ui-border-strong shrink-0"
    >
      <div class="flex items-center gap-3">
        <Icon
          v-if="icon"
          :icon="icon"
          class="w-5 h-5 ui-text"
        />
        <h3 class="font-semibold text-lg ui-text">
          {{ title }}
        </h3>
      </div>
      <div class="flex items-center gap-2">
        <slot name="header-actions" />
        
        <button
          class="p-2 rounded-lg hover:bg-[color:color-mix(in oklab, var(--ui-surface), transparent 20%)] transition-all duration-200 hover:scale-105 active:scale-95"
          title="Keyboard shortcuts (?)"
          @click="showKeyboardHelp = !showKeyboardHelp"
        >
          <Icon
            icon="circle-info"
            class="w-4 h-4 ui-text"
          />
        </button>

        <button
          v-if="customizationOptions.length > 0"
          class="p-2 rounded-lg hover:bg-[color:color-mix(in oklab, var(--ui-surface), transparent 20%)] transition-all duration-200 hover:scale-105 active:scale-95"
          :class="{ 'ui-primary-soft': showCustomization }"
          title="Customize (C)"
          @click="toggleCustomization"
        >
          <Icon
            icon="gear"
            class="w-4 h-4 ui-text"
          />
        </button>

        <button
          v-if="showRefresh"
          class="p-2 rounded-lg hover:bg-[color:color-mix(in oklab, var(--ui-surface), transparent 20%)] transition-all duration-200 hover:scale-105 active:scale-95"
          :disabled="loading"
          title="Refresh (R)"
          @click="$emit('refresh')"
        >
          <Icon
            icon="refresh"
            :class="[
              'w-4 h-4 ui-text transition-transform duration-500',
              { 'animate-spin': loading }
            ]"
          />
        </button>
      </div>
    </div>

    <div
      v-if="showCustomization"
      class="absolute top-16 right-4 z-20 ui-surface rounded-lg shadow-xl border ui-border-strong p-4 min-w-[250px]"
    >
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-semibold text-sm ui-text">
          Customize Widget
        </h4>
        <button
          class="p-1 rounded hover:bg-(--ui-surface)"
          @click="showCustomization = false"
        >
          <Icon
            icon="x"
            class="w-4 h-4 ui-text"
          />
        </button>
      </div>
      
      <div class="space-y-3">
        <div
          v-for="option in customizationOptions"
          :key="option.id"
          class="flex items-center justify-between"
        >
          <label
            :for="`setting-${option.id}`"
            class="text-sm ui-text cursor-pointer"
          >
            {{ option.label }}
          </label>
          <button
            :id="`setting-${option.id}`"
            :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              customSettings[option.id] ? 'ui-primary' : 'ui-surface'
            ]"
            @click="updateSetting(option.id, !customSettings[option.id])"
          >
            <span
              :class="[
                'inline-block h-4 w-4 transform rounded-full ui-surface transition-transform',
                customSettings[option.id] ? 'translate-x-6' : 'translate-x-1'
              ]"
            />
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showKeyboardHelp"
      class="absolute top-16 right-4 z-20 ui-surface rounded-lg shadow-xl border ui-border-strong p-4 min-w-[280px]"
    >
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-semibold text-sm ui-text">
          Keyboard Shortcuts
        </h4>
        <button
          class="p-1 rounded hover:bg-(--ui-surface)"
          @click="showKeyboardHelp = false"
        >
          <Icon
            icon="x"
            class="w-4 h-4 ui-text"
          />
        </button>
      </div>
      
      <div class="space-y-2">
        <div
          v-for="shortcut in keyboardShortcuts"
          :key="shortcut.key"
          class="flex items-center justify-between text-sm"
        >
          <span class="ui-text">{{ shortcut.description }}</span>
          <kbd class="px-2 py-1 ui-surface-muted border ui-border-strong rounded text-xs font-mono">
            {{ shortcut.key }}
          </kbd>
        </div>
      </div>
    </div>

    <div class="relative flex-1 overflow-hidden">
      <div
        v-if="loading"
        class="absolute inset-0 bg-[color:color-mix(in oklab, var(--ui-surface), transparent 10%)] backdrop-blur-sm z-10 flex items-center justify-center"
      >
        <Loader
          type="spin"
          size="medium"
          color="#3b82f6"
        />
      </div>
      
      <div
        v-if="chartType && chartData && chartComponent && chartComponentProps"
        class="w-full h-full flex items-center justify-center p-4"
        :class="paddingClasses[padding]"
      >
        <div class="w-full h-full flex items-center justify-center">
          <component
            :is="chartComponent"
            v-bind="chartComponentProps"
            :doughnut="isDoughnut"
          />
        </div>
      </div>
      
      <div
        v-else
        class="overflow-auto h-full"
        :class="paddingClasses[padding]"
      >
        <slot />
      </div>
    </div>

    <div
      v-if="$slots.footer"
      class="border-t ui-border-strong px-6 py-3 ui-surface-muted shrink-0"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
