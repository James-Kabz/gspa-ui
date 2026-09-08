<script setup>
import { nextTick, onMounted, onUnmounted, provide, ref, watch } from "vue"
import { cva } from "class-variance-authority"
import { cn } from "../utils/cn"

const props = defineProps({
  defaultIndex: { type: Number, default: 0 },
  modelValue: { type: Number, default: null },
  size: { type: String, default: 'sm' },
  variant: { type: String, default: 'default' },
  loading: { type: Boolean, default: false }
})

const tabVariants = cva(
  "relative z-10 rounded-lg font-medium transition-all duration-200 border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-primary)",
  {
    variants: {
      size: {
        sm: "px-2.5 py-1 text-[11px]",
        md: "px-3 py-1.5 text-xs",
        lg: "px-3.5 py-2 text-sm",
      },
      variant: {
        default: "",
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default"
    }
  }
)

const activeIndex = ref(props.modelValue ?? props.defaultIndex)
const tabs = ref([])
const tabRefs = ref([])
const indicatorStyle = ref({ width: '0px', transform: 'translateX(0px)' })

const selectTab = (index) => {
  if (index < 0 || index >= tabs.value.length) return
  activeIndex.value = index
  emit('update:modelValue', index)
  emit('tab-change', index)
  updateIndicator()
}

watch(() => props.modelValue, (value) => {
  if (typeof value === 'number' && value !== activeIndex.value) {
    activeIndex.value = value
    updateIndicator()
  }
})

const emit = defineEmits(['tab-change', 'update:modelValue'])

const setTabRef = (element, index) => {
  tabRefs.value[index] = element || null
}

const focusTab = (index) => {
  const target = tabRefs.value[index]
  if (target && typeof target.focus === 'function') {
    target.focus()
  }
}

const onTabKeydown = (event, index) => {
  if (props.loading) return

  const lastIndex = tabs.value.length - 1
  if (lastIndex < 0) return

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    const nextIndex = index >= lastIndex ? 0 : index + 1
    selectTab(nextIndex)
    focusTab(nextIndex)
    return
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    const prevIndex = index <= 0 ? lastIndex : index - 1
    selectTab(prevIndex)
    focusTab(prevIndex)
    return
  }

  if (event.key === 'Home') {
    event.preventDefault()
    selectTab(0)
    focusTab(0)
    return
  }

  if (event.key === 'End') {
    event.preventDefault()
    selectTab(lastIndex)
    focusTab(lastIndex)
  }
}

const updateIndicator = () => {
  nextTick(() => {
    const activeEl = tabRefs.value[activeIndex.value]
    if (!activeEl) {
      indicatorStyle.value = { width: '0px', transform: 'translateX(0px)' }
      return
    }

    indicatorStyle.value = {
      width: `${activeEl.offsetWidth}px`,
      transform: `translateX(${activeEl.offsetLeft}px)`
    }
  })
}

watch(() => tabs.value.length, () => {
  updateIndicator()
})

watch(activeIndex, () => {
  updateIndicator()
})

onMounted(() => {
  updateIndicator()
  window.addEventListener('resize', updateIndicator)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIndicator)
})

provide("tabsContext", {
  activeIndex,
  tabs,
  registerTab: (label) => {
    tabs.value.push({ label })
    const index = tabs.value.length - 1
    updateIndicator()
    return index
  },
  unregisterTab: (index) => {
    tabs.value.splice(index, 1)
    tabRefs.value.splice(index, 1)
    if (activeIndex.value >= tabs.value.length) {
      activeIndex.value = Math.max(tabs.value.length - 1, 0)
      emit('update:modelValue', activeIndex.value)
      emit('tab-change', activeIndex.value)
    }
    updateIndicator()
  }
})
</script>


<template>
  <div class="w-full">
    <!-- Tab headers -->
    <div
      class="relative inline-flex w-full gap-2 rounded-xl border ui-border-strong ui-surface-muted p-1.5"
      role="tablist"
    >
      <span
        class="pointer-events-none absolute top-1.5 bottom-1.5 rounded-lg bg-(--ui-primary) opacity-10 transition-all duration-250 ease-out z-0"
        :style="indicatorStyle"
      />
      <button
        v-for="(tab, index) in tabs"
        :id="`tab-${index}`"
        :key="index"
        :ref="(el) => setTabRef(el, index)"
        :disabled="props.loading"
        :class="cn(
          tabVariants({ size: props.size, variant: props.variant }),
          activeIndex === index
            ? 'bg-(--ui-primary) text-(--ui-text-inverse) shadow-sm'
            : 'border-transparent ui-text-muted hover:ui-text hover:bg-(--ui-surface)',
          props.loading && 'cursor-not-allowed opacity-50'
        )"
        :aria-selected="activeIndex === index"
        :aria-controls="`panel-${index}`"
        role="tab"
        tabindex="0"
        @keydown="onTabKeydown($event, index)"
        @click="!props.loading && selectTab(index)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab panels -->
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>