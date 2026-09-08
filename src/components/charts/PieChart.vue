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
        default: () => ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
    },
    width: {
        type: [Number, String],
        default: 'auto'
    },
    height: {
        type: [Number, String],
        default: 'auto'
    },
    doughnut: {
        type: Boolean,
        default: false
    },
    innerRadiusRatio: {
        type: Number,
        default: 0.6
    },
    showValues: {
        type: Boolean,
        default: true
    },
    minLabelPercentage: {
        type: Number,
        default: 3
    },
    showPercentages: {
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
    showCenterText: {
        type: Boolean,
        default: true
    },
    legendPosition: {
        type: String,
        default: 'bottom',
        validator: (value) => ['bottom', 'right'].includes(value)
    },
    strokeColor: {
        type: String,
        default: '#ffffff'
    },
    strokeWidth: {
        type: Number,
        default: 2
    },
    centerFill: {
        type: String,
        default: '#ffffff'
    },
    sliceClasses: {
        type: String,
        default: 'transition-all duration-200 hover:opacity-80 cursor-pointer'
    },
    valueLabelClasses: {
        type: String,
        default: 'fill-(--ui-surface) text-sm font-bold drop-shadow-md'
    },
    centerTextClasses: {
        type: String,
        default: 'fill-(--ui-text) text-2xl font-bold'
    },
    centerLabelClasses: {
        type: String,
        default: 'fill-(--ui-text) text-sm'
    },
    legendTextClasses: {
        type: String,
        default: 'fill-(--ui-text) text-xs font-medium'
    }
})

const emit = defineEmits(['slice-click', 'slice-hover'])
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
    percentage: '0',
    color: ''
})

// Computed properties
const normalizedData = computed(() => (
    Array.isArray(props.data)
        ? props.data.map((value) => Number(value) || 0)
        : []
))

const totalValue = computed(() => {
    const sum = normalizedData.value.reduce((sum, value) => sum + value, 0)
    return sum || 0
})

const hasValidData = computed(() => {
    return normalizedData.value.length > 0 && totalValue.value > 0
})

const legendItemsPerRow = 2
const legendVerticalSpacing = 24

const visibleSliceCount = computed(() => (
    normalizedData.value.filter((value) => value > 0).length
))

const legendRowCount = computed(() => {
    if (!props.showLegend || props.legendPosition !== 'bottom') return 0
    return Math.max(1, Math.ceil(visibleSliceCount.value / legendItemsPerRow))
})

const legendBlockHeight = computed(() => (
    props.showLegend && props.legendPosition === 'bottom'
        ? (legendRowCount.value * legendVerticalSpacing) + 8
        : 0
))

const centerX = computed(() => {
    return props.showLegend && props.legendPosition === 'right'
        ? resolvedWidth.value / 3
        : resolvedWidth.value / 2
})

const centerY = computed(() => {
    return (resolvedHeight.value - legendBlockHeight.value) / 2
})

const radius = computed(() => {
    const availableHeight = resolvedHeight.value - legendBlockHeight.value
    const availableWidth = props.showLegend && props.legendPosition === 'right'
        ? resolvedWidth.value * 0.6
        : resolvedWidth.value
    return Math.max(12, Math.min(availableWidth, availableHeight) / 2 - 40)
})

const innerRadius = computed(() => {
    return props.doughnut ? radius.value * props.innerRadiusRatio : 0
})

const slices = computed(() => {
    if (!hasValidData.value) return []

    const total = totalValue.value
    let currentAngle = -Math.PI / 2

    return normalizedData.value.map((value, index) => {
        const safeValue = value
        const percentage = ((safeValue / total) * 100).toFixed(1)
        const sliceAngle = (safeValue / total) * 2 * Math.PI
        const endAngle = currentAngle + sliceAngle

        const path = createArcPath(
            centerX.value,
            centerY.value,
            radius.value,
            innerRadius.value,
            currentAngle,
            endAngle
        )

        const labelRadius = props.doughnut
            ? (radius.value + innerRadius.value) / 2
            : radius.value * 0.7
        const midAngle = currentAngle + sliceAngle / 2
        const labelX = centerX.value + Math.cos(midAngle) * labelRadius
        const labelY = centerY.value + Math.sin(midAngle) * labelRadius

        const slice = {
            value: safeValue,
            percentage,
            path,
            labelX,
            labelY,
            label: props.labels[index] || `Item ${index + 1}`,
            startAngle: currentAngle,
            endAngle
        }

        currentAngle = endAngle

        return slice
    }).filter(slice => slice.value > 0)
})

const valueLabelSlices = computed(() => (
    slices.value.filter((slice) => Number(slice.percentage) >= props.minLabelPercentage)
))

// Methods
const createArcPath = (cx, cy, r, innerR, startAngle, endAngle) => {
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0

    if (innerR === 0) {
        return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
    } else {
        const x3 = cx + innerR * Math.cos(endAngle)
        const y3 = cy + innerR * Math.sin(endAngle)
        const x4 = cx + innerR * Math.cos(startAngle)
        const y4 = cy + innerR * Math.sin(startAngle)

        return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`
    }
}

const getSliceColor = (index) => {
    return props.colors[index % props.colors.length]
}

const getLegendX = (index) => {
    if (props.legendPosition === 'right') {
        return resolvedWidth.value * 0.65
    }
    const itemsPerRow = legendItemsPerRow
    const col = index % itemsPerRow
    return resolvedWidth.value / 4 + col * (resolvedWidth.value / 2)
}

const getLegendY = (index) => {
    if (props.legendPosition === 'right') {
        return 40 + index * 25
    }
    const itemsPerRow = legendItemsPerRow
    const row = Math.floor(index / itemsPerRow)
    const legendTop = resolvedHeight.value - legendBlockHeight.value + 6
    return legendTop + row * legendVerticalSpacing
}

const handleMouseEnter = (event, slice, index) => {
    tooltip.value = {
        visible: true,
        x: event.clientX,
        y: event.clientY,
        label: slice.label,
        value: slice.value,
        percentage: slice.percentage,
        color: getSliceColor(index)
    }

    emit('slice-hover', {
        value: slice.value,
        index,
        label: slice.label,
        percentage: slice.percentage
    })
}

const handleMouseLeave = () => {
    tooltip.value.visible = false
}

const handleSliceClick = (slice, index) => {
    emit('slice-click', {
        value: slice.value,
        index,
        label: slice.label,
        percentage: slice.percentage
    })
}

const formatValue = (value) => `${value}${props.valueSuffix}`

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
    <!-- Empty State -->
    <div
      v-if="!hasValidData"
      class="ui-surface w-full h-full flex items-center justify-center"
    >
      <div class="text-center">
        <div class="ui-text mb-2">
          <svg
            class="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
            />
          </svg>
        </div>
        <p class="text-sm ui-text">
          No data available
        </p>
      </div>
    </div>

    <!-- Chart -->
    <svg
      v-else
      :width="resolvedWidth"
      :height="resolvedHeight"
      :viewBox="`0 0 ${resolvedWidth} ${resolvedHeight}`"
      class="block mx-auto overflow-visible"
    >
      <!-- Pie slices -->
      <g>
        <path
          v-for="(slice, index) in slices"
          :key="`slice-${index}`"
          :d="slice.path"
          :fill="getSliceColor(index)"
          :stroke="strokeColor"
          :stroke-width="strokeWidth"
          :class="sliceClasses"
          @mouseenter="handleMouseEnter($event, slice, index)"
          @mouseleave="handleMouseLeave"
          @click="handleSliceClick(slice, index)"
        />
      </g>

      <!-- Center circle for doughnut -->
      <circle
        v-if="doughnut"
        :cx="centerX"
        :cy="centerY"
        :r="innerRadius"
        :fill="centerFill"
      />

      <!-- Center text for doughnut -->
      <g v-if="doughnut && showCenterText">
        <text
          :x="centerX"
          :y="centerY - 5"
          :class="centerTextClasses"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ formatValue(totalValue) }}
        </text>
        <text
          :x="centerX"
          :y="centerY + 15"
          :class="centerLabelClasses"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          Total
        </text>
      </g>

      <!-- Value labels on slices -->
      <g v-if="showValues">
        <text
          v-for="(slice, index) in valueLabelSlices"
          :key="`value-${index}`"
          :x="slice.labelX"
          :y="slice.labelY"
          :class="valueLabelClasses"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ showPercentages ? `${slice.percentage}%` : formatValue(slice.value) }}
        </text>
      </g>

      <!-- Legend -->
      <g v-if="showLegend">
        <g
          v-for="(slice, index) in slices"
          :key="`legend-${index}`"
          :transform="`translate(${getLegendX(index)}, ${getLegendY(index)})`"
        >
          <rect
            :width="12"
            :height="12"
            :fill="getSliceColor(index)"
            rx="2"
          />
          <text
            :x="18"
            :y="10"
            :class="legendTextClasses"
          >
            {{ slice.label }}
          </text>
        </g>
      </g>
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
        <div class="flex items-center gap-2 mb-1.5">
          <div
            :style="{ backgroundColor: tooltip.color }"
            class="w-3 h-3 rounded-full shadow-sm"
          />
          <p class="font-semibold text-sm">
            {{ tooltip.label }}
          </p>
        </div>
        <div class="flex items-baseline gap-2 ml-5">
          <span class="text-2xl font-bold">{{ formatValue(tooltip.value) }}</span>
        </div>
        <div class="mt-1 ml-5">
          <span class="text-xs ui-text">{{ tooltip.percentage }}% of total</span>
        </div>
        <!-- Tooltip arrow -->
        <div
          class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 ui-surface border-r border-b ui-border-strong"
        />
      </div>
    </div>
  </div>
</template>
