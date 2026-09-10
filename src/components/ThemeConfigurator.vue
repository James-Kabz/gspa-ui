<script setup>
import { ref, watch } from 'vue'
import { getMode, getTheme, setMode, setTheme, THEME_PRESETS } from '../lib/theme'
import Option from './Option.vue'
import Select from './Select.vue'

const modes = ['light', 'dark']

const open = ref(false)
const currentMode = ref(getMode() || 'light')
const currentPreset = ref(getTheme()?.preset || 'academy')

watch(currentMode, (value) => {
  setMode(value)
})

watch(currentPreset, (value) => {
  setTheme({ preset: value })
})
</script>

<template>
  <div class="ui-surface-strong fixed bottom-5 rounded-2xl right-5 z-50">
    <button
      class="rounded-full ui-text-inverse px-4 py-2 text-sm font-semibold shadow-sm hover:brightness-105"
      @click="open = !open"
    >
      Appearance
    </button>

    <div
      v-if="open"
      class="mt-3 ui-surface w-72 rounded-xl border ui-border-strong p-4 shadow-xl"
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
        <label class="block text-xs font-medium ui-text">
          Theme
          <Select
            v-model="currentPreset"
            class="mt-1 w-full"
          >
            <Option
              v-for="preset in THEME_PRESETS"
              :key="preset.key"
              :value="preset.key"
            >
              {{ preset.name }}
            </Option>
          </Select>
        </label>
      </div>
    </div>
  </div>
</template>
