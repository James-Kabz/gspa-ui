<template>
  <div
    v-show="isActive"
    :id="`panel-${index}`"
    role="tabpanel"
    :aria-labelledby="`tab-${index}`"
    class="ui-text"
  >
    <div class="rounded-xl border ui-border bg-(--ui-surface) p-2 shadow-xs">
      <div
        v-if="loading"
        class="flex items-center justify-center p-8"
      >
        <Spinner
          size="lg"
          :label="`Loading ${props.label}`"
        />
      </div>
      <div
        v-else
        class="transition-opacity duration-200 opacity-100"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted, onUnmounted, ref, watch } from "vue"
import Spinner from "./Spinner.vue"

/**
 * TabPanel component for displaying content within a tabbed interface.
 * Must be used as a child of the Tab component.
 */
const props = defineProps({
  label: { type: String, required: true },
  loading: { type: Boolean, default: false }
})

// Inject the tabs context provided by the parent Tab component
const tabsContext = inject("tabsContext")

if (!tabsContext) {
  throw new Error("TabPanel must be used within a Tab component")
}

// Reactive state for the tab's index and active status
const index = ref(null)
const isActive = ref(false)

onMounted(() => {
  // Register this tab panel with the parent Tab component
  index.value = tabsContext.registerTab(props.label)
  isActive.value = tabsContext.activeIndex.value === index.value

  // Watch for changes in the active tab index
  watch(tabsContext.activeIndex, (newIndex) => {
    isActive.value = newIndex === index.value
  })
})

onUnmounted(() => {
  // Unregister the tab panel when the component is destroyed
  if (index.value !== null) {
    tabsContext.unregisterTab(index.value)
  }
})
</script>
