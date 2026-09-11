<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@gspa/ui'

const dateOfBirth = ref('')
const currentYear = new Date().getFullYear()
const yesterdayDate = new Date()
yesterdayDate.setDate(yesterdayDate.getDate() - 1)
const yesterday = [
  yesterdayDate.getFullYear(),
  String(yesterdayDate.getMonth() + 1).padStart(2, '0'),
  String(yesterdayDate.getDate()).padStart(2, '0')
].join('-')
</script>

<template>
  <label class="block max-w-sm space-y-2 ui-text">
    <span class="text-sm font-medium">Date of birth</span>
    <DatePicker
      v-model="dateOfBirth"
      initial-view="year"
      :year-range="[1900, currentYear]"
      :max-date="yesterday"
      format="YYYY-MM-DD"
    />
    <span class="block text-xs ui-text-muted">
      API value: {{ dateOfBirth || 'YYYY-MM-DD' }}
    </span>
  </label>
</template>
