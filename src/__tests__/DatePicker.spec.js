import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import DatePicker from '../components/DatePicker.vue'

const mounted = []

function mountPicker(props = {}) {
  const wrapper = mount(DatePicker, {
    attachTo: document.body,
    props,
    global: {
      stubs: { Teleport: true, Transition: false }
    }
  })
  mounted.push(wrapper)
  return wrapper
}

async function open(wrapper, key = null) {
  const input = wrapper.get('input')
  if (key) await input.trigger('keydown', { key })
  else await input.trigger('click')
  await wrapper.vm.$nextTick()
}

afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
  document.body.innerHTML = ''
})

describe('DatePicker', () => {
  it('keeps the existing day view, display format, v-model event, and validation event', async () => {
    const wrapper = mountPicker({ modelValue: '2024-05-10', min: '2024-05-10', max: '2024-05-31' })

    expect(wrapper.get('input').element.value).toBe('10/05/2024')
    expect(wrapper.emitted('validation-error')?.at(-1)).toEqual([null])

    await open(wrapper)
    expect(wrapper.get('[role="grid"]').attributes('aria-label')).toBe('May 2024')
    await wrapper.get('button[aria-label="May 11, 2024"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['2024-05-11'])
  })

  it('opens directly in the year view and focuses its selected year', async () => {
    const wrapper = mountPicker({
      modelValue: '1990-06-15',
      initialView: 'year',
      yearRange: [1900, 2026]
    })

    await open(wrapper)

    const grid = wrapper.get('[role="grid"]')
    const selectedYear = wrapper.get('button[aria-label="Select year 1990"]')
    expect(grid.attributes('aria-label')).toContain('Select a year')
    expect(selectedYear.attributes('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(selectedYear.element)

    await selectedYear.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(wrapper.get('button[aria-label="Select year 1991"]').element)
  })

  it('moves backward and forward between year ranges', async () => {
    const wrapper = mountPicker({
      modelValue: '1990-06-15',
      initialView: 'year',
      yearRange: [1900, 2026]
    })
    await open(wrapper)

    expect(wrapper.text()).toContain('1984–1995')
    await wrapper.get('button[aria-label="Previous year range"]').trigger('click')
    expect(wrapper.text()).toContain('1972–1983')
    await wrapper.get('button[aria-label="Next year range"]').trigger('click')
    expect(wrapper.text()).toContain('1984–1995')
  })

  it('selects a year, then a month, then a day and emits an API-safe date', async () => {
    const wrapper = mountPicker({
      modelValue: '',
      initialView: 'year',
      yearRange: [1980, 1991],
      maxDate: '1991-12-31'
    })
    await open(wrapper)

    await wrapper.get('button[aria-label="Select year 1990"]').trigger('click')
    await flushPromises()
    expect(document.activeElement?.getAttribute('aria-label')).toMatch(/^Select /)

    await wrapper.get('button[aria-label="Select June 1990"]').trigger('click')
    await flushPromises()
    await wrapper.get('button[aria-label="June 15, 1990"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['1990-06-15'])
  })

  it('enforces minDate and maxDate for dates, months, and navigation', async () => {
    const wrapper = mountPicker({
      modelValue: '2020-06-15',
      minDate: '2020-06-10',
      maxDate: '2020-07-05'
    })
    await open(wrapper)

    const beforeMin = wrapper.get('button[aria-label="June 9, 2020"]')
    expect(beforeMin.attributes()).toMatchObject({ disabled: '', 'aria-disabled': 'true' })
    await beforeMin.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await wrapper.get('button[aria-label^="Select the month"]').trigger('click')
    expect(wrapper.get('button[aria-label="Select May 2020"]').attributes('disabled')).toBe('')
    expect(wrapper.get('button[aria-label="Select June 2020"]').attributes('aria-disabled')).toBe('false')
    expect(wrapper.get('button[aria-label="Select August 2020"]').attributes('disabled')).toBe('')
  })

  it('supports keyboard opening and day navigation without entering disabled dates', async () => {
    const wrapper = mountPicker({
      modelValue: '2020-06-15',
      maxDate: '2020-06-16'
    })
    await open(wrapper, 'ArrowDown')

    const day15 = wrapper.get('button[aria-label="June 15, 2020"]')
    expect(document.activeElement).toBe(day15.element)
    await day15.trigger('keydown', { key: 'ArrowRight' })
    const day16 = wrapper.get('button[aria-label="June 16, 2020"]')
    expect(document.activeElement).toBe(day16.element)
    await day16.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(day16.element)
  })

  it('closes on Escape, restores input focus, and does not change the value', async () => {
    const wrapper = mountPicker({ modelValue: '1990-06-15', initialView: 'year' })
    await open(wrapper)
    await wrapper.get('button[aria-label="Select year 1990"]').trigger('keydown', { key: 'Escape' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(document.activeElement).toBe(wrapper.get('input').element)
  })

  it('uses semantic token classes for light and dark theme compatibility', async () => {
    const wrapper = mountPicker({ modelValue: '2024-05-10' })
    await open(wrapper)

    expect(wrapper.get('[role="dialog"]').classes()).toEqual(expect.arrayContaining(['ui-surface', 'ui-border-strong']))
    expect(wrapper.get('button[aria-label="May 10, 2024"]').classes()).toContain('ui-primary-bg')
    expect(wrapper.html()).toContain('ring-(--ui-ring)')
    expect(wrapper.html()).not.toContain('dark:')
  })
})
