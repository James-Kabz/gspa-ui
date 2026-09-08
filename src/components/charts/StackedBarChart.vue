<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    // Expected format: [{ complied: 60, uncomplied: 40 }, ...]
  },
  labels: {
    type: Array,
    default: () => []
  },
  colors: {
    type: Array,
    default: () => ['#f97316', '#10b981'], // [complied color, uncomplied color]
  },
  groupKeys: {
    type: Array,
    default: () => ['complied', 'uncomplied'] // Left to right order
  },
  width: {
    type: [Number, String],
    default: 'auto'
  },
  height: {
    type: [Number, String],
    default: 'auto'
  },
  padding: {
    type: Object,
    default: () => ({ top: 20, right: 20, bottom: 60, left: 60 })
  },
  showGrid: {
    type: Boolean,
    default: true
  },
  showXAxis: {
    type: Boolean,
    default: true
  },
  showYAxis: {
    type: Boolean,
    default: true
  },
  gridColor: {
    type: String,
    default: '#e5e7eb'
  },
  barClasses: {
    type: String,
    default: 'transition-all duration-200 hover:opacity-90 cursor-pointer'
  },
  axisLabelClasses: {
    type: String,
    default: 'fill-(--ui-text) text-xs font-medium'
  },
  maxValue: {
    type: Number,
    default: 100 // Default for percentages
  },
  xAxisLabel: {
    type: String,
    default: ''
  },
  yAxisLabel: {
    type: String,
    default: ''
  },
  showValues: {
    type: Boolean,
    default: true
  },
  valueSuffix: {
    type: String,
    default: ''
  },
  showLegend: {
    type: Boolean,
    default: true
  },
  legendLabels: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['bar-click', 'bar-hover'])
const containerRef = ref(null)
const containerSize = ref({ width: 0, height: 0 })
let resizeObserver = null

const resolvedWidth = computed(() => {
  const explicit = Number(props.width)
  if (Number.isFinite(explicit) && explicit > 0) return explicit
  return containerSize.value.width > 0 ? containerSize.value.width : 400
})

const resolvedHeight = computed(() => {
  const explicit = Number(props.height)
  if (Number.isFinite(explicit) && explicit > 0) return explicit
  return containerSize.value.height > 0 ? containerSize.value.height : 300
})

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  label: '',
  barLabel: '',
  value: 0,
  color: ''
})

const chartHeight = computed(() => {
  return resolvedHeight.value - props.padding.top - props.padding.bottom
})

const chartWidth = computed(() => {
  return resolvedWidth.value - props.padding.left - props.padding.right
})

// Width for each group (all bars for one label)
const groupWidth = computed(() => {
  return chartWidth.value / props.data.length * 0.8
})

// Spacing between groups
const groupSpacing = computed(() => {
  return chartWidth.value / props.data.length * 0.2
})

// Width of individual bars within a group
const barWidth = computed(() => groupWidth.value / props.groupKeys.length)

// Spacing between bars within a group
const barSpacing = computed(() => 0)

const yTicks = computed(() => {
  const ticks = []
  const numTicks = 5

  for (let i = 0; i <= numTicks; i++) {
    const y = props.padding.top + (chartHeight.value / numTicks) * i
    ticks.push(y)
  }

  return ticks
})

// Get X position for the start of a group
const getGroupX = (dataIndex) => {
  return props.padding.left + dataIndex * (groupWidth.value + groupSpacing.value) + groupSpacing.value / 2
}

// Get X position for a specific bar within a group
const getBarX = (dataIndex, barIndex) => {
  const groupX = getGroupX(dataIndex)
  return groupX + barIndex * (barWidth.value + barSpacing.value)
}

const getBarY = (value) => {
  const scale = chartHeight.value / props.maxValue
  return props.padding.top + chartHeight.value - (value * scale)
}

const getBarHeight = (value) => {
  const scale = chartHeight.value / props.maxValue
  return value * scale
}

const getBarColor = (barIndex) => {
  return props.colors[barIndex % props.colors.length]
}

const getBarValueLabelY = (value) => {
  if ((Number(value) || 0) <= 0) return props.padding.top + chartHeight.value - 6
  return Math.max(getBarY(value) + 18, props.padding.top + 16)
}

const getBarValueLabelClass = (value) => {
  return (Number(value) || 0) <= 0
    ? 'fill-(--ui-text) text-[10px] font-semibold'
    : 'fill-white text-[10px] font-semibold'
}

const getYAxisLabel = (tick) => {
  const value = ((resolvedHeight.value - props.padding.bottom - tick) / chartHeight.value) * props.maxValue
  return formatValue(Math.round(value))
}

const formatBarLabel = (key) => {
  return key.charAt(0).toUpperCase() + key.slice(1)
}

const resolvedValueSuffix = computed(() => {
  if (props.valueSuffix) return props.valueSuffix
  if (String(props.yAxisLabel || '').includes('%')) return '%'
  if (props.maxValue === 100) return '%'
  return ''
})

const formatValue = (value) => `${value}${resolvedValueSuffix.value}`

const resolvedLegendItems = computed(() => {
  return props.groupKeys.map((key, index) => ({
    key,
    color: getBarColor(index),
    label: props.legendLabels[index] || formatBarLabel(key)
  }))
})

const handleMouseEnter = (event, dataIndex, barIndex) => {
  const item = props.data[dataIndex]
  const key = props.groupKeys[barIndex]
  const value = item[key] || 0
  const label = props.labels[dataIndex] || `Item ${dataIndex + 1}`
  const barLabel = formatBarLabel(key)

  tooltip.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    label,
    barLabel,
    value,
    color: getBarColor(barIndex)
  }

  emit('bar-hover', { dataIndex, barIndex, key, value, label })
}

const handleMouseLeave = () => {
  tooltip.value.visible = false
}

const handleBarClick = (dataIndex, barIndex) => {
  const item = props.data[dataIndex]
  const key = props.groupKeys[barIndex]
  const value = item[key] || 0
  const label = props.labels[dataIndex] || `Item ${dataIndex + 1}`

  emit('bar-click', { dataIndex, barIndex, key, value, label })
}

onMounted(() => {
  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry) return
    const { width, height } = entry.contentRect
    containerSize.value = {
      width: Math.round(width),
      height: Math.round(height)
    }
  })
  if (containerRef.value) resizeObserver.observe(containerRef.value)
})

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect()
})
</script>

<template>
  <div
    ref="containerRef"
    class="w-full h-full relative"
  >
    <div
      v-if="showLegend"
      class="absolute top-3 left-3 z-10 ui-surface border ui-border-strong rounded-md px-2.5 py-2"
    >
      <div class="flex items-center gap-3 flex-wrap">
        <div
          v-for="item in resolvedLegendItems"
          :key="`legend-${item.key}`"
          class="flex items-center gap-1.5"
        >
          <span
            class="w-2.5 h-2.5 rounded-sm"
            :style="{ backgroundColor: item.color }"
          />
          <span class="text-xs font-semibold ui-text">
            {{ item.label }}
          </span>
        </div>
      </div>
    </div>
    <svg
      :width="resolvedWidth"
      :height="resolvedHeight"
      :viewBox="`0 0 ${resolvedWidth} ${resolvedHeight}`"
      class="overflow-visible"
    >
      <!-- Grid lines -->
      <g v-if="showGrid">
        <line
          v-for="tick in yTicks"
          :key="`grid-${tick}`"
          :x1="padding.left"
          :y1="tick"
          :x2="resolvedWidth - padding.right"
          :y2="tick"
          :stroke="gridColor"
          stroke-width="1"
          stroke-dasharray="4,4"
          opacity="0.3"
        />
      </g>

      <!-- Gradients for each bar type -->
      <defs>
        <linearGradient
          v-for="(key, barIndex) in groupKeys"
          :id="`barGradient-${barIndex}`"
          :key="`gradient-${barIndex}`"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop
            offset="0%"
            :stop-color="getBarColor(barIndex)"
            stop-opacity="0.95"
          />
          <stop
            offset="100%"
            :stop-color="getBarColor(barIndex)"
            stop-opacity="0.85"
          />
        </linearGradient>
      </defs>

      <!-- Grouped Bars -->
      <g>
        <g
          v-for="(item, dataIndex) in data"
          :key="`bar-group-${dataIndex}`"
        >
          <rect
            v-for="(key, barIndex) in groupKeys"
            :key="`bar-${dataIndex}-${barIndex}`"
            :x="getBarX(dataIndex, barIndex)"
            :y="getBarY(item[key] || 0)"
            :width="barWidth"
            :height="getBarHeight(item[key] || 0)"
            :fill="`url(#barGradient-${barIndex})`"
            :class="barClasses"
            rx="4"
            @mouseenter="handleMouseEnter($event, dataIndex, barIndex)"
            @mouseleave="handleMouseLeave"
            @click="handleBarClick(dataIndex, barIndex)"
          >
            <animate
              attributeName="height"
              :from="0"
              :to="getBarHeight(item[key] || 0)"
              dur="0.6s"
              :begin="`${barIndex * 0.1}s`"
              fill="freeze"
            />
            <animate
              attributeName="y"
              :from="padding.top + chartHeight"
              :to="getBarY(item[key] || 0)"
              dur="0.6s"
              :begin="`${barIndex * 0.1}s`"
              fill="freeze"
            />
          </rect>
          <g v-if="showValues">
            <text
              v-for="(key, barIndex) in groupKeys"
              :key="`bar-value-${dataIndex}-${barIndex}`"
              :x="getBarX(dataIndex, barIndex) + barWidth / 2"
              :y="getBarValueLabelY(item[key] || 0)"
              :class="getBarValueLabelClass(item[key] || 0)"
              text-anchor="middle"
            >
              {{ formatValue(item[key] || 0) }}
            </text>
          </g>
        </g>
      </g>

      <!-- X-axis labels (centered under each group) -->
      <g v-if="showXAxis">
        <text
          v-for="(label, index) in labels"
          :key="`xlabel-${index}`"
          :x="getGroupX(index) + groupWidth / 2"
          :y="resolvedHeight - padding.bottom + 20"
          :class="axisLabelClasses"
          text-anchor="middle"
        >
          {{ label }}
        </text>
      </g>

      <!-- X-axis title -->
      <g v-if="xAxisLabel">
        <text
          :x="padding.left + chartWidth / 2"
          :y="resolvedHeight - 10"
          class="fill-(--ui-text) text-sm font-semibold"
          text-anchor="middle"
        >
          {{ xAxisLabel }}
        </text>
      </g>

      <!-- Y-axis labels -->
      <g v-if="showYAxis">
        <text
          v-for="tick in yTicks"
          :key="`ylabel-${tick}`"
          :x="padding.left - 10"
          :y="tick + 4"
          :class="axisLabelClasses"
          text-anchor="end"
        >
          {{ getYAxisLabel(tick) }}
        </text>
      </g>

      <!-- Y-axis title -->
      <g v-if="yAxisLabel">
        <text
          :x="-(padding.top + chartHeight / 2)"
          :y="padding.left - 40"
          class="fill-(--ui-text) text-sm font-semibold"
          text-anchor="middle"
          transform="rotate(-90)"
        >
          {{ yAxisLabel }}
        </text>
      </g>

      <!-- Axes lines -->
      <line
        :x1="padding.left"
        :y1="padding.top"
        :x2="padding.left"
        :y2="resolvedHeight - padding.bottom"
        stroke="#cbd5e1"
        stroke-width="2"
      />
      <line
        :x1="padding.left"
        :y1="resolvedHeight - padding.bottom"
        :x2="resolvedWidth - padding.right"
        :y2="resolvedHeight - padding.bottom"
        stroke="#cbd5e1"
        stroke-width="2"
      />
    </svg>

    <!-- Professional Tooltip -->
    <div
      v-if="tooltip.visible"
      :style="{
        position: 'fixed',
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
        transform: 'translate(-50%, -120%)',
        pointerEvents: 'none',
        zIndex: 9999
      }"
      class="animate-in fade-in duration-200"
    >
      <div class="ui-surface ui-text px-4 py-3 rounded-lg shadow-2xl border ui-border-strong min-w-[180px]">
        <div class="flex items-center gap-2 mb-2">
          <div
            :style="{ backgroundColor: tooltip.color }"
            class="w-3 h-3 rounded shadow-sm"
          />
          <p class="font-semibold text-sm">
            {{ tooltip.label }}
          </p>
        </div>
        <div class="ml-5">
          <p class="text-xs ui-text mb-1">
            {{ tooltip.barLabel }}
          </p>
          <span class="text-2xl font-bold">{{ formatValue(tooltip.value) }}</span>
        </div>
        <!-- Tooltip arrow -->
        <div
          class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 ui-surface border-r border-b ui-border-strong"
        />
      </div>
    </div>
  </div>
</template>
