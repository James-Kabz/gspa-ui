<script setup>
import { ref, watch } from 'vue'
import { getMode, setMode } from '../lib/theme'
import Option from './Option.vue'
import Select from './Select.vue'

const modes = ['light', 'dark']

const open = ref(false)
const currentMode = ref(getMode() || 'light')

watch(currentMode, (value) => {
  setMode(value)
})
</script>

<template>
  <div class="ui-surface-strong fixed bottom-5 rounded-2xl right-5 z-50">
    <button
      class="rounded-full ui-text px-4 py-2 text-sm font-semibold shadow-sm hover:brightness-105"
      @click="open = !open"
    >
      Appearance
    </button>

    <div
      v-if="open"
      class="mt-3 ui-sur w-72 rounded-2xl border ui-border-strong p-4 shadow-xl"
    >
      <div class="text-sm font-semibold ui-text">
        Appearance
      </div>
      <div class="mt-3 space-y-3">
        <label class="block text-xs font-medium ui-text">
          Mode
          <Select
            v-model="currentMode"
            class="mt-1 w-full"
          >
            <Option
              v-for="mode in modes"
              :key="mode"
              :value="mode"
            >
              {{ mode }}
            </Option>
          </Select>
        </label>
      </div>
    </div>
  </div>
</template>
