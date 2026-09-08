<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  labels: {
    type: Array,
    default: () => []
  },
  colors: {
    type: Array,
    default: () => ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
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
    default: null
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
  seriesLabel: {
    type: String,
    default: ''
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
  value: 0,
  color: ''
})

const maxDataValue = computed(() => {
  return props.maxValue || Math.max(...props.data)
})

const chartHeight = computed(() => {
  return resolvedHeight.value - props.padding.top - props.padding.bottom
})

const chartWidth = computed(() => {
  return resolvedWidth.value - props.padding.left - props.padding.right
})

const barWidth = computed(() => {
  return chartWidth.value / props.data.length * 0.7
})

const barSpacing = computed(() => {
  return chartWidth.value / props.data.length * 0.3
})

const yTicks = computed(() => {
  const ticks = []
  const numTicks = 5

  for (let i = 0; i <= numTicks; i++) {
    const y = props.padding.top + (chartHeight.value / numTicks) * i
    ticks.push(y)
  }

  return ticks
})

const getBarX = (index) => {
  return props.padding.left + index * (barWidth.value + barSpacing.value) + barSpacing.value / 2
}

const getBarY = (value) => {
  const scale = chartHeight.value / maxDataValue.value
  return props.padding.top + chartHeight.value - (value * scale)
}

const getBarHeight = (value) => {
  const scale = chartHeight.value / maxDataValue.value
  return value * scale
}

const getBarColor = (index) => {
  return props.colors[index % props.colors.length]
}

const getBarValueLabelY = (value) => {
  if ((Number(value) || 0) <= 0) return props.padding.top + chartHeight.value - 6
  return Math.max(getBarY(value) + 18, props.padding.top + 16)
}

const getBarValueLabelClass = (value) => {
  return (Number(value) || 0) <= 0
    ? 'fill-(--ui-text) text-[10px] sm:text-xs font-semibold'
    : 'fill-white text-[10px] sm:text-xs font-semibold'
}

const getYAxisLabel = (tick) => {
  const value = ((resolvedHeight.value - props.padding.bottom - tick) / chartHeight.value) * maxDataValue.value
  return formatValue(Math.round(value))
}

const resolvedValueSuffix = computed(() => {
  if (props.valueSuffix) return props.valueSuffix
  if (String(props.yAxisLabel || '').includes('%')) return '%'
  if (props.maxValue === 100) return '%'
  return ''
})

const formatValue = (value) => `${value}${resolvedValueSuffix.value}`

const resolvedSeriesLabel = computed(() => {
  return props.seriesLabel || props.yAxisLabel || 'Series'
})

const handleMouseEnter = (event, value, index) => {
  const label = props.labels[index] || `Item ${index + 1}`

  tooltip.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    label,
    value,
    color: getBarColor(index)
  }

  emit('bar-hover', { value, index, label })
}

const handleMouseLeave = () => {
  tooltip.value.visible = false
}

const handleBarClick = (value, index) => {
  const label = props.labels[index] || `Item ${index + 1}`
  emit('bar-click', { value, index, label })
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
    class="ui-surface w-full h-full relative"
  >
    <div
      v-if="showLegend"
      class="absolute top-3 left-3 z-10 ui-surface border ui-border-strong rounded-md px-2 py-1.5"
    >
      <div class="flex items-center gap-2">
        <span
          class="w-2.5 h-2.5 rounded-sm"
          :style="{ backgroundColor: getBarColor(0) }"
        />
        <span class="text-xs font-semibold ui-text">
          {{ resolvedSeriesLabel }}
        </span>
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

      <!-- Bars with gradient -->
      <defs>
        <linearGradient
          v-for="(value, index) in data"
          :id="`barGradient-${index}`"
          :key="`gradient-${index}`"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop
            offset="0%"
            :stop-color="getBarColor(index)"
            stop-opacity="1"
          />
          <stop
            offset="100%"
            :stop-color="getBarColor(index)"
            stop-opacity="0.7"
          />
        </linearGradient>
      </defs>

      <g>
        <g
          v-for="(value, index) in data"
          :key="`bar-group-${index}`"
        >
          <rect
            :x="getBarX(index)"
            :y="getBarY(value)"
            :width="barWidth"
            :height="getBarHeight(value)"
            :fill="`url(#barGradient-${index})`"
            :class="barClasses"
            rx="4"
            @mouseenter="handleMouseEnter($event, value, index)"
            @mouseleave="handleMouseLeave"
            @click="handleBarClick(value, index)"
          >
            <animate
              attributeName="height"
              :from="0"
              :to="getBarHeight(value)"
              dur="0.8s"
              fill="freeze"
            />
            <animate
              attributeName="y"
              :from="padding.top + chartHeight"
              :to="getBarY(value)"
              dur="0.8s"
              fill="freeze"
            />
          </rect>

          <text
            v-if="showValues"
            :x="getBarX(index) + barWidth / 2"
            :y="getBarValueLabelY(value)"
            :class="getBarValueLabelClass(value)"
            text-anchor="middle"
          >
            {{ formatValue(value) }}
          </text>
        </g>
      </g>

      <!-- X-axis labels -->
      <g v-if="showXAxis">
        <text
          v-for="(label, index) in labels"
          :key="`xlabel-${index}`"
          :x="getBarX(index) + barWidth / 2"
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
          :y="15"
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
      class="ui-surface-strong animate-in fade-in duration-200"
    >
      <div class="ui--surface ui-text px-4 py-3 rounded-lg shadow-2xl border ui-border-strong min-w-40">
        <div class="flex items-center gap-2 mb-1">
          <div
            :style="{ backgroundColor: tooltip.color }"
            class="w-3 h-3 rounded shadow-sm"
          />
          <p class="font-semibold text-sm">
            {{ tooltip.label }}
          </p>
        </div>
        <div class="ml-5">
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
