<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue'
import type { DatePickerDate, DatePickerView, DatePickerYearRange } from '../types.js'

// eslint-disable-next-line no-unused-vars
type DisabledDates = DatePickerDate[] | ((date: Date) => boolean)
// eslint-disable-next-line no-unused-vars
type DateValidation = (date: Date) => string | null

const props = defineProps({
  id: String,
  modelValue: { type: [String, Date] as PropType<DatePickerDate>, default: '' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  min: [String, Date] as PropType<DatePickerDate>,
  max: [String, Date] as PropType<DatePickerDate>,
  minDate: [String, Date] as PropType<DatePickerDate>,
  maxDate: [String, Date] as PropType<DatePickerDate>,
  yearRange: Array as unknown as PropType<DatePickerYearRange>,
  initialView: {
    type: String as PropType<DatePickerView>,
    default: 'day',
    validator: (value: string) => ['day', 'month', 'year'].includes(value)
  },
  placeholder: { type: String, default: 'Select date' },
  format: { type: String, default: 'DD/MM/YYYY' },
  clearable: { type: Boolean, default: true },
  showToday: { type: Boolean, default: true },
  calendarPosition: { type: String, default: 'left-0 bottom-full' },
  ariaDescribedby: String,
  customValidation: { type: Function as PropType<DateValidation>, default: null },
  disabledDates: { type: [Array, Function] as PropType<DisabledDates>, default: null },
  enableTime: { type: Boolean, default: false },
  minuteInterval: { type: Number, default: 1 }
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'validation-error': [error: string | null]
}>()

const YEAR_PAGE_SIZE = 12
const isOpen = ref(false)
const activeView = ref<DatePickerView>('day')
const calendarRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const calendarStyle = ref<Record<string, string>>({})
const today = startOfDay(new Date())
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const currentDay = ref(today.getDate())
const yearPageStart = ref(Math.floor(today.getFullYear() / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE)
const selectedDate = ref<Date | null>(null)
const hasValidationError = ref(false)
const selectedTime = ref('00:00')

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const monthNames = Array.from({ length: 12 }, (_, month) =>
  new Date(2000, month, 1).toLocaleString('default', { month: 'long' })
)

const parsedMin = computed(() => parseDate(props.minDate ?? props.min))
const parsedMax = computed(() => parseDate(props.maxDate ?? props.max))
const normalizedYearRange = computed<DatePickerYearRange | null>(() => {
  if (!props.yearRange || props.yearRange.length !== 2) return null
  const start = Math.trunc(Number(props.yearRange[0]))
  const end = Math.trunc(Number(props.yearRange[1]))
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null
  return start <= end ? [start, end] : [end, start]
})
const minimumYear = computed(() => Math.max(
  normalizedYearRange.value?.[0] ?? Number.NEGATIVE_INFINITY,
  parsedMin.value?.getFullYear() ?? Number.NEGATIVE_INFINITY
))
const maximumYear = computed(() => Math.min(
  normalizedYearRange.value?.[1] ?? Number.POSITIVE_INFINITY,
  parsedMax.value?.getFullYear() ?? Number.POSITIVE_INFINITY
))

const monthName = computed(() => monthNames[currentMonth.value])
const daysInMonth = computed(() => daysIn(currentYear.value, currentMonth.value))
const firstDayOfMonth = computed(() => makeDate(currentYear.value, currentMonth.value, 1).getDay())
const leadingDays = computed(() => {
  const previousMonthDays = daysIn(currentYear.value, currentMonth.value - 1)
  return Array.from(
    { length: firstDayOfMonth.value },
    (_, index) => previousMonthDays - firstDayOfMonth.value + index + 1
  )
})
const trailingDays = computed(() => {
  const totalCells = leadingDays.value.length + daysInMonth.value
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
  return Array.from({ length: remaining }, (_, index) => index + 1)
})
const displayedYears = computed(() =>
  Array.from({ length: YEAR_PAGE_SIZE }, (_, index) => yearPageStart.value + index)
    .filter(year => year >= minimumYear.value && year <= maximumYear.value)
)
const yearPageEnd = computed(() => yearPageStart.value + YEAR_PAGE_SIZE - 1)
const headingText = computed(() => {
  if (activeView.value === 'day') return `${monthName.value} ${currentYear.value}`
  if (activeView.value === 'month') return String(currentYear.value)
  const years = displayedYears.value
  return years.length ? `${years[0]}–${years[years.length - 1]}` : `${yearPageStart.value}–${yearPageEnd.value}`
})
const headingLabel = computed(() => {
  if (activeView.value === 'day') return `Select the month. Currently ${headingText.value}`
  if (activeView.value === 'month') return `Select the year. Currently ${currentYear.value}`
  return `Return to day selection. Showing years ${headingText.value}`
})
const previousLabel = computed(() => {
  if (activeView.value === 'day') return 'Previous month'
  if (activeView.value === 'month') return 'Previous year'
  return 'Previous year range'
})
const nextLabel = computed(() => {
  if (activeView.value === 'day') return 'Next month'
  if (activeView.value === 'month') return 'Next year'
  return 'Next year range'
})
const canNavigatePrevious = computed(() => {
  if (activeView.value === 'day') return monthIntersectsBounds(currentYear.value, currentMonth.value - 1)
  if (activeView.value === 'month') return currentYear.value - 1 >= minimumYear.value
  return yearPageStart.value > minimumYear.value
})
const canNavigateNext = computed(() => {
  if (activeView.value === 'day') return monthIntersectsBounds(currentYear.value, currentMonth.value + 1)
  if (activeView.value === 'month') return currentYear.value + 1 <= maximumYear.value
  return yearPageEnd.value < maximumYear.value
})
const displayValue = computed(() => {
  if (!selectedDate.value) return ''
  return props.enableTime ? formatDateTime(selectedDate.value) : formatDate(selectedDate.value)
})
const timeOptions = computed(() => {
  const step = Math.min(60, Math.max(1, Number(props.minuteInterval) || 1))
  const options: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += step) {
      options.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
    }
  }
  return options
})

function makeDate(year: number, month: number, day: number, hours = 0, minutes = 0) {
  const date = new Date(0)
  date.setFullYear(year, month, day)
  date.setHours(hours, minutes, 0, 0)
  return date
}

function startOfDay(value: Date) {
  return makeDate(value.getFullYear(), value.getMonth(), value.getDate())
}

function daysIn(year: number, month: number) {
  return makeDate(year, month + 1, 0).getDate()
}

function parseDate(value?: DatePickerDate | null) {
  if (!value) return null
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    return makeDate(value.getFullYear(), value.getMonth(), value.getDate(), value.getHours(), value.getMinutes())
  }
  const match = value.match(/^(\d{4,})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/)
  if (match) {
    const [, yearText, monthText, dayText, hourText = '0', minuteText = '0'] = match
    const year = Number(yearText)
    const month = Number(monthText) - 1
    const day = Number(dayText)
    const date = makeDate(year, month, day, Number(hourText), Number(minuteText))
    if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) return date
    return null
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function dateStamp(date: Date) {
  return makeDate(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function formatDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return props.format.replace('MM', month).replace('DD', day).replace('YYYY', String(date.getFullYear()))
}

function formatDateTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${formatDate(date)} ${hours}:${minutes}`
}

function formatISO(date: Date) {
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isWithinConfiguredRange(date: Date) {
  const stamp = dateStamp(date)
  if (parsedMin.value && stamp < dateStamp(parsedMin.value)) return false
  if (parsedMax.value && stamp > dateStamp(parsedMax.value)) return false
  if (normalizedYearRange.value &&
    (date.getFullYear() < normalizedYearRange.value[0] || date.getFullYear() > normalizedYearRange.value[1])) return false
  return true
}

function isUnavailable(date: Date) {
  if (!isWithinConfiguredRange(date)) return true
  if (props.disabledDates) {
    if (typeof props.disabledDates === 'function' && props.disabledDates(new Date(date))) return true
    if (Array.isArray(props.disabledDates) && props.disabledDates.some(value => {
      const disabledDate = parseDate(value)
      return disabledDate ? dateStamp(disabledDate) === dateStamp(date) : false
    })) return true
  }
  return Boolean(props.customValidation?.(new Date(date)))
}

function isDateDisabled(day: number) {
  return isUnavailable(makeDate(currentYear.value, currentMonth.value, day))
}

function isMonthDisabled(month: number) {
  for (let day = 1; day <= daysIn(currentYear.value, month); day++) {
    if (!isUnavailable(makeDate(currentYear.value, month, day))) return false
  }
  return true
}

function isYearDisabled(year: number) {
  if (year < minimumYear.value || year > maximumYear.value) return true
  for (let month = 0; month < 12; month++) {
    for (let day = 1; day <= daysIn(year, month); day++) {
      if (!isUnavailable(makeDate(year, month, day))) return false
    }
  }
  return true
}

function monthIntersectsBounds(year: number, month: number) {
  const start = makeDate(year, month, 1)
  const end = makeDate(start.getFullYear(), start.getMonth() + 1, 0)
  if (start.getFullYear() < minimumYear.value || start.getFullYear() > maximumYear.value) return false
  if (parsedMin.value && dateStamp(end) < dateStamp(parsedMin.value)) return false
  if (parsedMax.value && dateStamp(start) > dateStamp(parsedMax.value)) return false
  return true
}

function getYearPageStart(year: number) {
  const base = normalizedYearRange.value?.[0]
  if (base !== undefined) return base + Math.floor((year - base) / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE
  return Math.floor(year / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE
}

function clampToConfiguredRange(date: Date) {
  let candidate = startOfDay(date)
  if (normalizedYearRange.value && candidate.getFullYear() < normalizedYearRange.value[0]) candidate = makeDate(normalizedYearRange.value[0], 0, 1)
  if (normalizedYearRange.value && candidate.getFullYear() > normalizedYearRange.value[1]) candidate = makeDate(normalizedYearRange.value[1], 11, 31)
  if (parsedMin.value && dateStamp(candidate) < dateStamp(parsedMin.value)) candidate = startOfDay(parsedMin.value)
  if (parsedMax.value && dateStamp(candidate) > dateStamp(parsedMax.value)) candidate = startOfDay(parsedMax.value)
  return candidate
}

function isToday(day: number) {
  return today.getDate() === day && today.getMonth() === currentMonth.value && today.getFullYear() === currentYear.value
}

function isSelected(day: number) {
  return Boolean(selectedDate.value && selectedDate.value.getDate() === day &&
    selectedDate.value.getMonth() === currentMonth.value && selectedDate.value.getFullYear() === currentYear.value)
}

function validateDate(date: Date | null) {
  if (!date) {
    hasValidationError.value = false
    emit('validation-error', null)
    return true
  }
  const error = props.customValidation?.(new Date(date)) || null
  hasValidationError.value = Boolean(error)
  emit('validation-error', error)
  return !error
}

async function calculatePosition() {
  await nextTick()
  const input = inputRef.value || (props.id ? document.getElementById(props.id) : null)
  if (!input || !calendarRef.value) return
  const inputRect = input.getBoundingClientRect()
  const calendarHeight = calendarRef.value.offsetHeight || 360
  const calendarWidth = calendarRef.value.offsetWidth || (props.enableTime ? 448 : 320)
  const spaceBelow = window.innerHeight - inputRect.bottom
  const top = spaceBelow >= calendarHeight || spaceBelow > inputRect.top ? inputRect.bottom + 8 : Math.max(8, inputRect.top - calendarHeight - 8)
  const left = Math.min(Math.max(16, inputRect.left), Math.max(16, window.innerWidth - calendarWidth - 16))
  calendarStyle.value = { top: `${top}px`, left: `${left}px` }
}

function setDisplayDate(date: Date) {
  currentDay.value = date.getDate()
  currentMonth.value = date.getMonth()
  currentYear.value = date.getFullYear()
  yearPageStart.value = getYearPageStart(date.getFullYear())
}

async function openCalendar() {
  if (props.disabled || isOpen.value) return
  if (!selectedDate.value || !isWithinConfiguredRange(selectedDate.value)) {
    setDisplayDate(clampToConfiguredRange(today))
  }
  activeView.value = props.initialView
  yearPageStart.value = getYearPageStart(currentYear.value)
  isOpen.value = true
  await calculatePosition()
  await focusActiveView()
}

function toggleCalendar() {
  if (isOpen.value) closeCalendar()
  else void openCalendar()
}

function closeCalendar(restoreFocus = false) {
  isOpen.value = false
  if (restoreFocus) void nextTick(() => inputRef.value?.focus())
}

async function setView(view: DatePickerView) {
  activeView.value = view
  if (view === 'year') yearPageStart.value = getYearPageStart(currentYear.value)
  await nextTick()
  await calculatePosition()
  await focusActiveView()
}

function cycleView() {
  const nextView: Record<DatePickerView, DatePickerView> = { day: 'month', month: 'year', year: 'day' }
  void setView(nextView[activeView.value])
}

function navigatePrevious() {
  if (!canNavigatePrevious.value) return
  if (activeView.value === 'day') setDisplayDate(makeDate(currentYear.value, currentMonth.value - 1, 1))
  else if (activeView.value === 'month') currentYear.value--
  else yearPageStart.value = Math.max(yearPageStart.value - YEAR_PAGE_SIZE, minimumYear.value)
}

function navigateNext() {
  if (!canNavigateNext.value) return
  if (activeView.value === 'day') setDisplayDate(makeDate(currentYear.value, currentMonth.value + 1, 1))
  else if (activeView.value === 'month') currentYear.value++
  else yearPageStart.value += YEAR_PAGE_SIZE
}

function selectYear(year: number) {
  if (isYearDisabled(year)) return
  currentYear.value = year
  void setView('month')
}

function selectMonth(month: number) {
  if (isMonthDisabled(month)) return
  currentMonth.value = month
  currentDay.value = Math.min(currentDay.value, daysIn(currentYear.value, month))
  void setView('day')
}

function selectDate(day: number) {
  const date = makeDate(currentYear.value, currentMonth.value, day)
  if (isUnavailable(date) || !validateDate(date)) return
  const [hours = '0', minutes = '0'] = selectedTime.value.split(':')
  date.setHours(Number(hours), Number(minutes), 0, 0)
  selectedDate.value = date
  emitDateValue(date)
  if (!props.enableTime) window.setTimeout(() => closeCalendar(), 150)
}

function emitDateValue(date: Date) {
  const dateValue = formatISO(date)
  if (!props.enableTime) emit('update:modelValue', dateValue)
  else emit('update:modelValue', `${dateValue}T${selectedTime.value}`)
}

function selectToday() {
  if (isUnavailable(today)) return
  setDisplayDate(today)
  selectDate(today.getDate())
}

function clearDate() {
  selectedDate.value = null
  selectedTime.value = '00:00'
  hasValidationError.value = false
  emit('update:modelValue', '')
  emit('validation-error', null)
}

function enabledViewButtons() {
  return Array.from(calendarRef.value?.querySelectorAll<HTMLButtonElement>('[data-picker-option]:not(:disabled)') || [])
}

async function focusActiveView() {
  await nextTick()
  const buttons = enabledViewButtons()
  const selected = buttons.find(button => button.getAttribute('aria-selected') === 'true')
  const preferred = buttons.find(button => button.dataset.focusPreferred === 'true')
  ;(selected || preferred || buttons[0])?.focus()
}

function handleGridKeydown(event: KeyboardEvent, columns: number) {
  const buttons = enabledViewButtons()
  const index = buttons.indexOf(event.currentTarget as HTMLButtonElement)
  if (index < 0) return
  let nextIndex = index
  if (event.key === 'ArrowRight') nextIndex = Math.min(buttons.length - 1, index + 1)
  else if (event.key === 'ArrowLeft') nextIndex = Math.max(0, index - 1)
  else if (event.key === 'ArrowDown') nextIndex = Math.min(buttons.length - 1, index + columns)
  else if (event.key === 'ArrowUp') nextIndex = Math.max(0, index - columns)
  else if (event.key === 'Home') nextIndex = index - (index % columns)
  else if (event.key === 'End') nextIndex = Math.min(buttons.length - 1, index + columns - 1 - (index % columns))
  else return
  event.preventDefault()
  buttons[nextIndex]?.focus()
}

function handleDayKeydown(event: KeyboardEvent, day: number) {
  if (event.key === 'PageUp' || event.key === 'PageDown') {
    event.preventDefault()
    const direction = event.key === 'PageUp' ? -1 : 1
    const target = makeDate(currentYear.value, currentMonth.value + direction, Math.min(day, daysIn(currentYear.value, currentMonth.value + direction)))
    if (monthIntersectsBounds(target.getFullYear(), target.getMonth())) {
      setDisplayDate(target)
      void nextTick(() => focusDayNear(target.getDate(), direction))
    }
    return
  }
  if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const offsets: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }
  let offset = offsets[event.key]
  if (event.key === 'Home') offset = -makeDate(currentYear.value, currentMonth.value, day).getDay()
  if (event.key === 'End') offset = 6 - makeDate(currentYear.value, currentMonth.value, day).getDay()
  let target = makeDate(currentYear.value, currentMonth.value, day + offset)
  const direction = offset < 0 ? -1 : 1
  for (let attempts = 0; attempts < 3660; attempts++) {
    if (!isWithinConfiguredRange(target)) return
    if (!isUnavailable(target)) {
      setDisplayDate(target)
      void nextTick(() => focusDayNear(target.getDate(), direction))
      return
    }
    target = makeDate(target.getFullYear(), target.getMonth(), target.getDate() + direction)
  }
}

function focusDayNear(day: number, direction: number) {
  const buttons = enabledViewButtons()
  const exact = buttons.find(button => Number(button.dataset.day) === day)
  ;(exact || (direction < 0 ? buttons.at(-1) : buttons[0]))?.focus()
}

function handleInputKeydown(event: KeyboardEvent) {
  if (['Enter', ' ', 'ArrowDown'].includes(event.key)) {
    event.preventDefault()
    void openCalendar()
  } else if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault()
    closeCalendar(true)
  }
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault()
    closeCalendar(true)
  }
}

function handleResize() {
  if (isOpen.value) void calculatePosition()
}

watch(() => props.modelValue, value => {
  const date = parseDate(value)
  if (!date) {
    selectedDate.value = null
    hasValidationError.value = false
    return
  }
  selectedDate.value = date
  selectedTime.value = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  setDisplayDate(date)
  validateDate(date)
}, { immediate: true })

watch([normalizedYearRange, parsedMin, parsedMax], () => {
  if (!selectedDate.value && !isOpen.value) setDisplayDate(clampToConfiguredRange(today))
})

watch(selectedTime, value => {
  if (!props.enableTime || !selectedDate.value) return
  const [hours = '0', minutes = '0'] = value.split(':')
  selectedDate.value.setHours(Number(hours), Number(minutes), 0, 0)
  emitDateValue(selectedDate.value)
})

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="relative w-full rounded-md bg-(--ui-surface)">
    <div class="relative">
      <input
        :id="id"
        ref="inputRef"
        type="text"
        :value="displayValue"
        readonly
        :disabled="disabled"
        :placeholder="placeholder"
        :required="required"
        :aria-describedby="ariaDescribedby"
        aria-haspopup="dialog"
        :aria-expanded="isOpen"
        :class="[
          'w-full cursor-pointer rounded-md border px-3 py-2 pr-10 text-sm ui-surface ui-text placeholder:text-(--ui-text-muted) transition-colors',
          'focus:border-(--ui-primary) focus:outline-none focus:ring-2 focus:ring-(--ui-ring)',
          'disabled:cursor-not-allowed disabled:bg-(--ui-surface-muted) disabled:text-(--ui-text-muted)',
          hasValidationError ? 'border-(--ui-danger) focus:border-(--ui-danger) focus:ring-(--ui-danger)' : 'ui-border'
        ]"
        @click="toggleCalendar"
        @keydown="handleInputKeydown"
      >

      <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <svg
          class="h-4 w-4 ui-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      <button
        v-if="clearable && displayValue && !disabled"
        type="button"
        class="absolute right-9 top-1/2 -translate-y-1/2 rounded p-1 ui-text-muted transition-colors hover:bg-(--ui-surface-muted) hover:text-(--ui-text) focus-visible:ring-2 focus-visible:ring-(--ui-ring)"
        aria-label="Clear date"
        @click.stop="clearDate"
      >
        <svg
          class="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="scale-95 opacity-0"
        enter-to-class="scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-95 opacity-0"
      >
        <div
          v-if="isOpen"
          ref="calendarRef"
          :style="calendarStyle"
          role="dialog"
          aria-label="Choose date"
          aria-modal="false"
          class="fixed z-10000 max-w-[calc(100vw-2rem)] rounded-lg border p-3 shadow-xl ui-surface ui-border-strong"
          :class="enableTime ? 'w-[28rem]' : 'w-80'"
          @click.stop
        >
          <div :class="enableTime ? 'grid grid-cols-1 gap-3 sm:grid-cols-[1fr_7.75rem]' : 'block'">
            <div class="min-w-0">
              <div class="mb-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  class="rounded p-1.5 ui-text-muted transition-colors hover:bg-(--ui-surface-muted) hover:text-(--ui-text) focus-visible:ring-2 focus-visible:ring-(--ui-ring) disabled:cursor-not-allowed disabled:opacity-40"
                  :disabled="!canNavigatePrevious"
                  :aria-disabled="!canNavigatePrevious"
                  :aria-label="previousLabel"
                  @click="navigatePrevious"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 18l-6-6 6-6"
                  /></svg>
                </button>
                <button
                  type="button"
                  class="min-w-0 flex-1 rounded px-2 py-1 text-sm font-semibold ui-text transition-colors hover:bg-(--ui-surface-muted) focus-visible:ring-2 focus-visible:ring-(--ui-ring)"
                  :aria-label="headingLabel"
                  @click="cycleView"
                >
                  {{ headingText }}
                </button>
                <button
                  type="button"
                  class="rounded p-1.5 ui-text-muted transition-colors hover:bg-(--ui-surface-muted) hover:text-(--ui-text) focus-visible:ring-2 focus-visible:ring-(--ui-ring) disabled:cursor-not-allowed disabled:opacity-40"
                  :disabled="!canNavigateNext"
                  :aria-disabled="!canNavigateNext"
                  :aria-label="nextLabel"
                  @click="navigateNext"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 18l6-6-6-6"
                  /></svg>
                </button>
              </div>

              <template v-if="activeView === 'day'">
                <div
                  class="mb-1 grid grid-cols-7 gap-1"
                  aria-hidden="true"
                >
                  <div
                    v-for="day in weekdays"
                    :key="day"
                    class="py-1 text-center text-xs font-medium ui-text-muted"
                  >
                    {{ day }}
                  </div>
                </div>
                <div
                  class="grid grid-cols-7 gap-1"
                  role="grid"
                  :aria-label="`${monthName} ${currentYear}`"
                >
                  <div
                    v-for="(day, index) in leadingDays"
                    :key="`prev-${index}`"
                    class="py-1.5 text-center text-xs ui-text-soft"
                    aria-hidden="true"
                  >
                    {{ day }}
                  </div>
                  <button
                    v-for="day in daysInMonth"
                    :key="day"
                    type="button"
                    role="gridcell"
                    data-picker-option
                    :data-day="day"
                    :data-focus-preferred="day === currentDay"
                    :disabled="isDateDisabled(day)"
                    :aria-disabled="isDateDisabled(day)"
                    :aria-selected="isSelected(day)"
                    :aria-label="`${monthName} ${day}, ${currentYear}`"
                    :class="[
                      'h-8 w-full min-w-0 rounded text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-(--ui-ring)',
                      isToday(day) && !isSelected(day) ? 'ui-primary-soft ring-1 ring-(--ui-primary)' : '',
                      isSelected(day) ? 'ui-primary-bg' : 'ui-text hover:bg-(--ui-surface-muted)',
                      isDateDisabled(day) ? 'cursor-not-allowed text-(--ui-text-soft) opacity-45 line-through hover:bg-transparent' : 'cursor-pointer'
                    ]"
                    @click="selectDate(day)"
                    @keydown="handleDayKeydown($event, day)"
                  >
                    {{ day }}
                  </button>
                  <div
                    v-for="(day, index) in trailingDays"
                    :key="`next-${index}`"
                    class="py-1.5 text-center text-xs ui-text-soft"
                    aria-hidden="true"
                  >
                    {{ day }}
                  </div>
                </div>
              </template>

              <div
                v-else-if="activeView === 'month'"
                class="grid grid-cols-3 gap-2"
                role="grid"
                :aria-label="`Select a month in ${currentYear}`"
              >
                <button
                  v-for="(month, index) in monthNames"
                  :key="month"
                  type="button"
                  role="gridcell"
                  data-picker-option
                  :data-focus-preferred="index === currentMonth"
                  :disabled="isMonthDisabled(index)"
                  :aria-disabled="isMonthDisabled(index)"
                  :aria-selected="selectedDate?.getFullYear() === currentYear && selectedDate?.getMonth() === index"
                  :aria-label="`Select ${month} ${currentYear}`"
                  :class="[
                    'min-h-11 rounded px-2 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-(--ui-ring)',
                    selectedDate?.getFullYear() === currentYear && selectedDate?.getMonth() === index ? 'ui-primary-bg' : 'ui-text hover:bg-(--ui-surface-muted)',
                    isMonthDisabled(index) ? 'cursor-not-allowed text-(--ui-text-soft) opacity-45 hover:bg-transparent' : ''
                  ]"
                  @click="selectMonth(index)"
                  @keydown="handleGridKeydown($event, 3)"
                >
                  {{ month.slice(0, 3) }}
                </button>
              </div>

              <div
                v-else
                class="grid grid-cols-3 gap-2 sm:grid-cols-4"
                role="grid"
                :aria-label="`Select a year from ${headingText}`"
              >
                <button
                  v-for="year in displayedYears"
                  :key="year"
                  type="button"
                  role="gridcell"
                  data-picker-option
                  :data-focus-preferred="year === currentYear"
                  :disabled="isYearDisabled(year)"
                  :aria-disabled="isYearDisabled(year)"
                  :aria-selected="selectedDate?.getFullYear() === year"
                  :aria-label="`Select year ${year}`"
                  :class="[
                    'min-h-11 rounded px-1 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-(--ui-ring)',
                    selectedDate?.getFullYear() === year ? 'ui-primary-bg' : 'ui-text hover:bg-(--ui-surface-muted)',
                    isYearDisabled(year) ? 'cursor-not-allowed text-(--ui-text-soft) opacity-45 hover:bg-transparent' : ''
                  ]"
                  @click="selectYear(year)"
                  @keydown="handleGridKeydown($event, 3)"
                >
                  {{ year }}
                </button>
              </div>

              <div
                v-if="showToday && activeView === 'day'"
                class="mt-3 border-t pt-2 ui-border"
              >
                <button
                  type="button"
                  class="w-full rounded px-3 py-1.5 text-xs font-medium ui-primary transition-colors hover:bg-(--ui-primary-soft) focus-visible:ring-2 focus-visible:ring-(--ui-ring) disabled:cursor-not-allowed disabled:opacity-40"
                  :disabled="isUnavailable(today)"
                  :aria-disabled="isUnavailable(today)"
                  @click="selectToday"
                >
                  Today
                </button>
              </div>
            </div>

            <div
              v-if="enableTime"
              class="border-t pt-3 ui-border sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0"
            >
              <div class="mb-2 text-xs font-semibold ui-text">
                Time
              </div>
              <div class="max-h-64 space-y-1 overflow-y-auto pr-1">
                <button
                  v-for="time in timeOptions"
                  :key="time"
                  type="button"
                  class="w-full rounded px-2 py-1.5 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-(--ui-ring)"
                  :class="time === selectedTime ? 'ui-primary-bg' : 'ui-text hover:bg-(--ui-surface-muted)'"
                  :aria-selected="time === selectedTime"
                  @click="selectedTime = time"
                >
                  {{ time }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
