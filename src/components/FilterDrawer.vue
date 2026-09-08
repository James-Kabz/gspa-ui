<template>
  <div v-if="open" class="fixed inset-0 z-[70]">
    <div class="absolute inset-0 bg-black/35" @click="$emit('close')" />
    <aside class="absolute right-0 top-0 h-full w-full sm:w-[520px] ui-surface border-l ui-border-strong shadow-2xl flex flex-col">
      <div class="px-4 py-3 flex items-center justify-between border-b ui-border-strong">
        <h2 class="text-xl font-semibold ui-text">Filter</h2>
        <button class="ui-primary font-semibold" @click="resetAll">Reset</button>
      </div>

      <div class="px-2 py-2 border-b ui-border-strong">
        <div class="flex items-center gap-3 ui-text">
          <Icon icon="search" class="w-4 h-4 ui-primary" />
          <input v-model="search" placeholder="Filter Search" class="w-full bg-transparent outline-none text-base placeholder:ui-text" />
        </div>
      </div>

      <div class="flex-1 overflow-auto">
        <div v-for="field in visibleFields" :key="field.key" class="border-b ui-border-strong">
          <button class="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-(--ui-surface-muted)" @click="toggleField(field.key)">
            <span class="text-base ui-text font-medium flex items-center gap-1">
              {{ field.label }}
              <span v-if="fieldRuleCount(field.key) > 0" class="inline-flex items-center justify-center min-w-5 h-5 rounded-full text-xs ui-primary-bg text-white px-1">
                {{ fieldRuleCount(field.key) }}
              </span>
            </span>
            <span class="flex items-center gap-2">
              <button
                v-if="fieldRuleCount(field.key) > 0"
                class="h-5 min-w-7 px-1 rounded-full border ui-border-strong inline-flex items-center justify-center ui-text/80 hover:ui-primary hover:border-(--ui-primary)"
                @click.stop="clearFieldRules(field.key)"
                title="Clear filter"
              >
                <Icon icon="xmark" class="w-2.5 h-2.5" />
              </button>
              <Icon icon="chevron-right" class="w-4 h-4 ui-primary" />
            </span>
          </button>

          <div v-if="expandedField === field.key" class="ui-surface-muted px-4 pb-3">
            <div class="flex items-center gap-2 py-2">
              <span class="text-sm font-semibold ui-text">{{ field.label }}</span>
              <select v-model="operator" class="ml-auto rounded-md ui-surface border ui-border-strong px-3 py-2 text-sm ui-text">
                <option
                  v-for="option in getOperatorOptions(field)"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div
              v-if="usesOptionSearch(field)"
              class="flex items-center gap-2 border-b border-(--ui-primary) pb-1.5 mb-2"
            >
              <Icon icon="search" class="w-4 h-4 ui-primary" />
              <input v-model="valueSearch" placeholder="Search" class="w-full bg-transparent outline-none text-sm ui-text" />
            </div>

            <div v-if="field.type === 'date'" class="space-y-2">
              <label v-for="option in filteredFieldOptions(field)" :key="String(option.value)" class="flex items-center gap-2 text-sm ui-text cursor-pointer py-0.5">
                <input
                  type="checkbox"
                  :checked="isOptionChecked(field.key, option.value)"
                  @change="toggleOptionRule(field, option.value)"
                >
                <span>{{ option.label }}</span>
              </label>

              <div class="grid grid-cols-2 gap-1.5">
                <input v-model="dateFrom" type="date" class="w-full ui-surface border ui-border-strong rounded-md px-2 py-1 text-sm ui-text">
                <input v-model="dateTo" type="date" class="w-full ui-surface border ui-border-strong rounded-md px-2 py-1 text-sm ui-text">
              </div>
              <button class="px-3 py-1.5 rounded-md ui-primary-bg text-white text-sm" @click="addDateRangeRule(field)">Apply Date Range</button>
            </div>

            <div v-else-if="isDirectInputField(field)" class="space-y-2">
              <div v-if="operator === 'between' && field.type === 'number'" class="grid grid-cols-2 gap-2">
                <input
                  :value="getRangeValue(field.key, 'from')"
                  type="number"
                  :step="field.step || 'any'"
                  :placeholder="field.minLabel || 'Min'"
                  class="w-full ui-surface border ui-border-strong rounded-md px-3 py-2 text-sm ui-text"
                  @input="setRangeValue(field, 'from', $event.target.value)"
                >
                <input
                  :value="getRangeValue(field.key, 'to')"
                  type="number"
                  :step="field.step || 'any'"
                  :placeholder="field.maxLabel || 'Max'"
                  class="w-full ui-surface border ui-border-strong rounded-md px-3 py-2 text-sm ui-text"
                  @input="setRangeValue(field, 'to', $event.target.value)"
                >
              </div>
              <input
                v-else
                :value="getDirectValue(field.key)"
                :type="field.type === 'number' ? 'number' : 'text'"
                :step="field.type === 'number' ? (field.step || 'any') : undefined"
                :placeholder="field.placeholder || `Enter ${field.label}`"
                class="w-full ui-surface border ui-border-strong rounded-md px-3 py-2 text-sm ui-text"
                @input="setDirectValue(field, $event.target.value)"
              >
            </div>

            <div
              v-else-if="field.type === 'multiselect' || (field.type === 'select' && field.multiple)"
              class="space-y-2"
            >
              <div
                v-if="getFieldSelectedValues(field.key).length > 0"
                class="flex flex-wrap gap-1.5"
              >
                <span
                  v-for="selectedValue in getFieldSelectedValues(field.key)"
                  :key="`${field.key}-${selectedValue}`"
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border ui-border-strong ui-text"
                >
                  {{ getOptionLabel(field, selectedValue) }}
                  <button
                    class="ui-text-soft hover:ui-primary"
                    @click="toggleOptionRule(field, selectedValue)"
                  >
                    <Icon icon="xmark" class="w-3 h-3" />
                  </button>
                </span>
                <button
                  class="text-xs ui-primary hover:underline ml-1"
                  @click="clearFieldRules(field.key)"
                >
                  Clear all
                </button>
              </div>

              <div class="space-y-1.5 max-h-56 overflow-auto">
                <label v-for="option in filteredFieldOptions(field)" :key="String(option.value)" class="flex items-center gap-2 text-sm ui-text cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    :checked="isMultiOptionChecked(field.key, option.value)"
                    @change="toggleMultiSelectValue(field, option.value)"
                  >
                  <span>{{ option.label }}</span>
                </label>
              </div>
            </div>

            <div v-else class="space-y-1.5 max-h-56 overflow-auto">
              <label v-for="option in filteredFieldOptions(field)" :key="String(option.value)" class="flex items-center gap-2 text-sm ui-text cursor-pointer py-0.5">
                <input
                  type="checkbox"
                  :checked="isOptionChecked(field.key, option.value)"
                  @change="toggleOptionRule(field, option.value)"
                >
                <span>{{ option.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="px-5 py-4 border-t ui-border-strong">
        <div class="flex gap-6 text-sm mb-4 ui-text">
          <button class="flex items-center gap-2" @click="setLogic('any')">
            <input type="checkbox" :checked="logic === 'any'" class="accent-(--ui-primary)">
            Any of these
          </button>
          <button class="flex items-center gap-2" @click="setLogic('all')">
            <input type="checkbox" :checked="logic === 'all'" class="accent-(--ui-primary)">
            All of these
          </button>
        </div>
        <div class="flex gap-3">
          <button class="px-5 py-2 rounded-lg ui-primary-bg text-white text-sm" @click="apply">Find</button>
          <button class="px-5 py-2 rounded-lg border border-(--ui-primary) ui-primary text-sm" @click="$emit('close')">Cancel</button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  fields: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({ logic: 'all', rules: [] }) }
})

const emit = defineEmits(['close', 'update:modelValue', 'apply'])
const search = ref('')
const expandedField = ref('')
const operator = ref('equals')
const valueSearch = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const logic = ref('all')
const localRules = ref([])

watch(() => props.modelValue, (v) => {
  logic.value = v?.logic || 'all'
  localRules.value = Array.isArray(v?.rules) ? [...v.rules] : []
}, { immediate: true, deep: true })

const visibleFields = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.fields
  return props.fields.filter(f => String(f.label).toLowerCase().includes(q))
})

const fieldRuleCount = (fieldKey) => localRules.value.filter(r => r.field === fieldKey).length
const clearFieldRules = (fieldKey) => {
  localRules.value = localRules.value.filter(r => r.field !== fieldKey)
}
const getFieldRule = (fieldKey) => localRules.value.find((r) => r.field === fieldKey)
const getFieldSelectedValues = (fieldKey) => {
  const rule = getFieldRule(fieldKey)
  if (!rule) return []
  if (Array.isArray(rule.value)) return rule.value
  return rule.value == null ? [] : [rule.value]
}
const getOptionLabel = (field, value) => {
  const option = (field.options || []).find((opt) => String(opt.value) === String(value))
  return option ? option.label : value
}

const textOperatorOptions = [
  { value: 'equals', label: 'Is' },
  { value: 'not_equals', label: 'Is not' },
  { value: 'contains', label: 'Contains' }
]

const numberOperatorOptions = [
  { value: 'equals', label: 'Is' },
  { value: 'not_equals', label: 'Is not' },
  { value: 'gte', label: 'At least' },
  { value: 'lte', label: 'At most' },
  { value: 'between', label: 'Between' }
]

const isDirectInputField = (field) => {
  if (field.type === 'number' || field.type === 'text') return true
  return !['date', 'multiselect', 'multi', 'select'].includes(field.type) && !(field.options || []).length
}

const usesOptionSearch = (field) => {
  if (field.type === 'date') return true
  if (isDirectInputField(field)) return false
  return true
}

const getOperatorOptions = (field) => {
  if (field.type === 'number') return numberOperatorOptions
  return textOperatorOptions
}

const filteredFieldOptions = (field) => {
  const fallbackDateOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'today_overdue', label: 'Today + Overdue' }
  ]
  const options = Array.isArray(field.options) && field.options.length > 0
    ? field.options
    : (field.type === 'date' ? fallbackDateOptions : [])

  const q = valueSearch.value.trim().toLowerCase()
  if (!q) return options
  return options.filter(o => String(o.label).toLowerCase().includes(q))
}

const toggleField = (key) => {
  const next = expandedField.value === key ? '' : key
  expandedField.value = next
  valueSearch.value = ''
  const currentRule = getFieldRule(key)
  operator.value = currentRule?.operator || 'equals'
}
const setLogic = (v) => { logic.value = v }

const isOptionChecked = (fieldKey, optionValue) =>
  localRules.value.some((r) => r.field === fieldKey && String(r.value) === String(optionValue))

const isMultiOptionChecked = (fieldKey, optionValue) =>
  getFieldSelectedValues(fieldKey).map(String).includes(String(optionValue))

const toggleMultiSelectValue = (field, value) => {
  const selected = getFieldSelectedValues(field.key)
  const exists = selected.map(String).includes(String(value))
  const nextSelected = exists
    ? selected.filter((v) => String(v) !== String(value))
    : [...selected, value]

  localRules.value = localRules.value.filter((r) => r.field !== field.key)
  if (nextSelected.length > 0) {
    localRules.value.push({
      id: `${field.key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      field: field.key,
      label: field.label,
      operator: 'in',
      value: nextSelected
    })
  }
}

const toggleOptionRule = (field, value) => {
  const idx = localRules.value.findIndex((r) => r.field === field.key && String(r.value) === String(value))
  if (idx >= 0) {
    localRules.value.splice(idx, 1)
    return
  }
  localRules.value.push({
    id: `${field.key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    field: field.key,
    label: field.label,
    operator: operator.value,
    value,
  })
}

const getDirectValue = (fieldKey) => {
  const rule = getFieldRule(fieldKey)
  if (!rule || rule.operator === 'between') return ''
  return rule.value ?? ''
}

const setDirectValue = (field, value) => {
  const normalizedValue = field.type === 'number' ? value.trim() : value
  localRules.value = localRules.value.filter((r) => r.field !== field.key)
  if (normalizedValue === '') return
  localRules.value.push({
    id: `${field.key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    field: field.key,
    label: field.label,
    operator: operator.value,
    value: normalizedValue
  })
}

const getRangeValue = (fieldKey, key) => {
  const rule = getFieldRule(fieldKey)
  if (!rule || rule.operator !== 'between' || typeof rule.value !== 'object' || rule.value === null) return ''
  return rule.value[key] ?? ''
}

const setRangeValue = (field, key, value) => {
  const currentValue = {
    from: getRangeValue(field.key, 'from'),
    to: getRangeValue(field.key, 'to')
  }
  currentValue[key] = value.trim()
  localRules.value = localRules.value.filter((r) => r.field !== field.key)
  if (!currentValue.from && !currentValue.to) return
  localRules.value.push({
    id: `${field.key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    field: field.key,
    label: field.label,
    operator: 'between',
    value: currentValue
  })
}

watch(operator, (nextOperator) => {
  const fieldKey = expandedField.value
  if (!fieldKey) return
  const field = props.fields.find((item) => item.key === fieldKey)
  if (!field || !isDirectInputField(field)) return

  const existingRule = getFieldRule(fieldKey)
  if (!existingRule) return

  localRules.value = localRules.value.filter((rule) => rule.field !== fieldKey)

  if (nextOperator === 'between' && field.type === 'number') {
    const nextValue = typeof existingRule.value === 'object' && existingRule.value !== null
      ? {
          from: existingRule.value.from ?? '',
          to: existingRule.value.to ?? ''
        }
      : { from: existingRule.value ?? '', to: '' }

    if (!nextValue.from && !nextValue.to) return

    localRules.value.push({
      ...existingRule,
      operator: 'between',
      value: nextValue
    })
    return
  }

  const nextValue = typeof existingRule.value === 'object' && existingRule.value !== null
    ? existingRule.value.from ?? existingRule.value.to ?? ''
    : existingRule.value

  if (nextValue === '') return

  localRules.value.push({
    ...existingRule,
    operator: nextOperator,
    value: nextValue
  })
})

const addDateRangeRule = (field) => {
  if (!dateFrom.value && !dateTo.value) return
  localRules.value = localRules.value.filter(r => r.field !== field.key)
  localRules.value.push({
    id: `${field.key}-${Date.now()}`,
    field: field.key,
    label: field.label,
    operator: 'between',
    value: { from: dateFrom.value, to: dateTo.value }
  })
}

const apply = () => {
  const payload = { logic: logic.value, rules: localRules.value }
  emit('update:modelValue', payload)
  emit('apply', payload)
  emit('close')
}

const resetAll = () => {
  localRules.value = []
  logic.value = 'all'
  dateFrom.value = ''
  dateTo.value = ''
  emit('update:modelValue', { logic: 'all', rules: [] })
}
</script>
