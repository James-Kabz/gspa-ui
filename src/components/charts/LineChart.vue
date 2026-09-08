<template>
  <div
    ref="containerRef"
    class="ui-surface w-full h-full"
  >
    <svg
      :width="resolvedWidth"
      :height="resolvedHeight"
      :viewBox="`0 0 ${resolvedWidth} ${resolvedHeight}`"
      class="block mx-auto overflow-visible"
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
          stroke-dasharray="2,2"
        />
      </g>

      <!-- Line -->
      <path
        :d="linePath"
        :stroke="lineColor"
        :stroke-width="strokeWidth"
        fill="none"
        :class="lineClasses"
      />

      <!-- Data points -->
      <g v-if="showPoints">
        <circle
          v-for="(point, index) in dataPoints"
          :key="`point-${index}`"
          :cx="point.x"
          :cy="point.y"
          :r="pointRadius"
          :fill="pointColor"
          :stroke="lineColor"
          :stroke-width="2"
          :class="pointClasses"
          @mouseenter="handleMouseEnter(point, index)"
          @mouseleave="handleMouseLeave"
        />
      </g>

      <!-- Value labels -->
      <g v-if="showValues">
        <text
          v-for="(point, index) in dataPoints"
          :key="`value-${index}`"
          :x="point.x"
          :y="point.y - 10"
          class="fill-(--ui-text) text-[10px] font-semibold"
          text-anchor="middle"
        >
          {{ formatValue(point.value) }}
        </text>
      </g>

      <!-- Area fill -->
      <path
        v-if="fillArea"
        :d="areaPath"
        :fill="fillColor"
        :fill-opacity="fillOpacity"
      />

      <!-- X-axis labels -->
      <g v-if="showXAxis">
        <text
          v-for="(label, index) in labels"
          v-show="shouldRenderXAxisLabel(index)"
          :key="`xlabel-${index}`"
          :x="getPointX(index)"
          :y="xAxisLabelY"
          :class="axisLabelClasses"
          :text-anchor="xAxisLabelAnchor"
          :transform="getXAxisLabelTransform(index)"
        >
          {{ formatXAxisLabel(label) }}
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

      <!-- Tooltip -->
      <g v-if="tooltip.visible">
        <rect
          :x="tooltipBoxX"
          :y="tooltipBoxY"
          :width="tooltip.width"
          :height="tooltip.height"
          :fill="tooltipBackground"
          :stroke="tooltipBorder"
          stroke-width="1"
          rx="4"
        />
        <text
          :x="tooltipTextX"
          :y="tooltipTextY"
          :class="tooltipTextClasses"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ tooltip.content }}
        </text>
      </g>
    </svg>
  </div>
</template>

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
  showPoints: {
    type: Boolean,
    default: true
  },
  showValues: {
    type: Boolean,
    default: true
  },
  valueSuffix: {
    type: String,
    default: ''
  },
  fillArea: {
    type: Boolean,
    default: false
  },
  gridColor: {
    type: String,
    default: '#e5e7eb'
  },
  lineColor: {
    type: String,
    default: '#3b82f6'
  },
  strokeWidth: {
    type: Number,
    default: 2
  },
  pointRadius: {
    type: Number,
    default: 4
  },
  pointColor: {
    type: String,
    default: '#ffffff'
  },
  fillColor: {
    type: String,
    default: '#3b82f6'
  },
  fillOpacity: {
    type: Number,
    default: 0.1
  },
  lineClasses: {
    type: String,
    default: 'transition-all duration-200'
  },
  pointClasses: {
    type: String,
    default: 'transition-all duration-200 hover:r-6 cursor-pointer'
  },
  axisLabelClasses: {
    type: String,
    default: 'fill-(--ui-text) text-xs font-medium'
  },
  autoSkipXAxisLabels: {
    type: Boolean,
    default: true
  },
  minLabelSpacing: {
    type: Number,
    default: 72
  },
  maxLabelLength: {
    type: Number,
    default: 16
  },
  rotateLabelsWhenDense: {
    type: Boolean,
    default: true
  },
  labelRotationDegrees: {
    type: Number,
    default: -35
  },
  tooltipBackground: {
    type: String,
    default: '#1f2937'
  },
  tooltipBorder: {
    type: String,
    default: '#374151'
  },
  tooltipTextClasses: {
    type: String,
    default: 'fill-white text-xs font-semibold'
  },
  maxValue: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['point-click', 'point-hover'])
const containerRef = ref(null)
const containerSize = ref({ width: 0, height: 0 })
let resizeObserver = null

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  content: ''
})

const resolvedWidth = computed(() => {
  const numericWidth = Number(props.width)
  if (Number.isFinite(numericWidth) && numericWidth > 0) return numericWidth
  return containerSize.value.width > 0 ? containerSize.value.width : 400
})

const resolvedHeight = computed(() => {
  const numericHeight = Number(props.height)
  if (Number.isFinite(numericHeight) && numericHeight > 0) return numericHeight
  return containerSize.value.height > 0 ? containerSize.value.height : 300
})

// Computed properties
const maxDataValue = computed(() => {
  if (props.maxValue && props.maxValue > 0) return props.maxValue

  const numericValues = props.data.map((value) => Number(value) || 0)
  const detectedMax = Math.max(0, ...numericValues)
  return detectedMax > 0 ? detectedMax : 1
})

const dataPoints = computed(() => {
  return props.data.map((value, index) => ({
    x: getPointX(index),
    y: getPointY(value),
    value
  }))
})

const linePath = computed(() => {
  if (dataPoints.value.length === 0) return ''

  const path = dataPoints.value.map((point, index) => {
    return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  }).join(' ')

  return path
})

const areaPath = computed(() => {
  if (dataPoints.value.length === 0) return ''

  const line = dataPoints.value.map((point, index) => {
    return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  }).join(' ')

  const bottomY = resolvedHeight.value - props.padding.bottom
  const bottomLine = `L ${dataPoints.value[dataPoints.value.length - 1].x} ${bottomY} L ${dataPoints.value[0].x} ${bottomY} Z`

  return line + ' ' + bottomLine
})

const yTicks = computed(() => {
  const ticks = []
  const chartHeight = resolvedHeight.value - props.padding.top - props.padding.bottom
  const numTicks = 5

  for (let i = 0; i <= numTicks; i++) {
    const y = props.padding.top + (chartHeight / numTicks) * i
    ticks.push(y)
  }

  return ticks
})

const availableWidth = computed(() => {
  return resolvedWidth.value - props.padding.left - props.padding.right
})

const xAxisLabelStep = computed(() => {
  if (!props.autoSkipXAxisLabels) return 1
  if (!props.labels.length) return 1

  const maxVisibleLabels = Math.max(1, Math.floor(availableWidth.value / Math.max(1, props.minLabelSpacing)))
  return Math.max(1, Math.ceil(props.labels.length / maxVisibleLabels))
})

const shouldRotateXAxisLabels = computed(() => {
  if (!props.rotateLabelsWhenDense) return false
  return xAxisLabelStep.value > 1
})

const xAxisLabelY = computed(() => {
  return resolvedHeight.value - props.padding.bottom + (shouldRotateXAxisLabels.value ? 28 : 20)
})

const xAxisLabelAnchor = computed(() => {
  return shouldRotateXAxisLabels.value ? 'end' : 'middle'
})

const tooltipBoxX = computed(() => {
  const minX = props.padding.left
  const maxX = resolvedWidth.value - props.padding.right - tooltip.value.width
  const targetX = tooltip.value.x - tooltip.value.width / 2
  return Math.min(Math.max(targetX, minX), Math.max(minX, maxX))
})

const tooltipBoxY = computed(() => {
  const targetY = tooltip.value.y - tooltip.value.height - 10
  const minY = props.padding.top + 4
  return Math.max(targetY, minY)
})

const tooltipTextX = computed(() => tooltipBoxX.value + tooltip.value.width / 2)
const tooltipTextY = computed(() => tooltipBoxY.value + tooltip.value.height / 2 + 0.5)

// Methods
const getPointX = (index) => {
  const spacing = availableWidth.value / (props.data.length - 1 || 1)
  return props.padding.left + index * spacing
}

const getPointY = (value) => {
  const chartHeight = resolvedHeight.value - props.padding.top - props.padding.bottom
  const scale = chartHeight / maxDataValue.value
  return props.padding.top + chartHeight - (value * scale)
}

const getYAxisLabel = (tick) => {
  const chartHeight = resolvedHeight.value - props.padding.top - props.padding.bottom
  const value = ((resolvedHeight.value - props.padding.bottom - tick) / chartHeight) * maxDataValue.value
  return formatValue(Math.round(value))
}

const formatValue = (value) => `${value}${props.valueSuffix}`

const handleMouseEnter = (point, index) => {
  const label = props.labels[index] || `Point ${index + 1}`
  const value = Number(point.value)
  const displayValue = Number.isFinite(value) ? value.toLocaleString() : String(point.value ?? 0)
  const content = `${label}: ${formatValue(displayValue)}`
  const width = Math.min(280, Math.max(120, content.length * 7.2 + 20))

  tooltip.value = {
    visible: true,
    x: Number(point.x) || 0,
    y: Number(point.y) || 0,
    width,
    height: 28,
    content
  }

  emit('point-hover', { value: point.value, index, label })
}

const handleMouseLeave = () => {
  tooltip.value.visible = false
}

const shouldRenderXAxisLabel = (index) => {
  if (!props.autoSkipXAxisLabels) return true
  if (props.labels.length <= 2) return true
  return index % xAxisLabelStep.value === 0 || index === props.labels.length - 1
}

const formatXAxisLabel = (label) => {
  const text = String(label ?? '')
  if (!text) return ''
  if (!props.maxLabelLength || props.maxLabelLength <= 0) return text
  if (text.length <= props.maxLabelLength) return text
  return `${text.slice(0, Math.max(1, props.maxLabelLength - 1))}…`
}

const getXAxisLabelTransform = (index) => {
  if (!shouldRotateXAxisLabels.value) return undefined
  const x = getPointX(index)
  const y = xAxisLabelY.value
  return `rotate(${props.labelRotationDegrees} ${x} ${y})`
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
