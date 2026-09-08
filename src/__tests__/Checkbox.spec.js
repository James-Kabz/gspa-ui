import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Checkbox from '../components/Checkbox.vue'

describe('Checkbox', () => {
  it('renders with default props', () => {
    const wrapper = mount(Checkbox)
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
  })

  it('accepts v-model (boolean)', async () => {
    const wrapper = mount(Checkbox, {
      props: { modelValue: true }
    })
    const input = wrapper.find('input[type="checkbox"]')
    expect(input.element.checked).toBe(true)

    await input.setChecked(false)
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
  })

  it('handles array modelValue', async () => {
    const wrapper = mount(Checkbox, {
      props: { modelValue: ['option1'], value: 'option2' }
    })
    const input = wrapper.find('input[type="checkbox"]')

    await input.setChecked(true)
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([['option1', 'option2']])
  })

  it('displays label', () => {
    const wrapper = mount(Checkbox, {
      props: { label: 'Test Label' }
    })
    expect(wrapper.text()).toContain('Test Label')
  })

  it('displays description', () => {
    const wrapper = mount(Checkbox, {
      props: { description: 'Test description' }
    })
    expect(wrapper.text()).toContain('Test description')
  })

  it('applies disabled state', () => {
    const wrapper = mount(Checkbox, {
      props: { disabled: true }
    })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    const indicator = wrapper.find('div').find('div').find('div') // The custom indicator div
    expect(indicator.classes()).toContain('cursor-not-allowed')
  })

  it('shows indeterminate state', () => {
    const wrapper = mount(Checkbox, {
      props: { indeterminate: true }
    })
    expect(wrapper.find('input').element.indeterminate).toBe(true)
  })

  it('applies size classes', () => {
    const wrapper = mount(Checkbox, {
      props: { size: 'lg' }
    })
    const indicator = wrapper.find('div').find('div').find('div') // The custom indicator div
    expect(indicator.classes()).toContain('w-6')
  })

  it('applies error variant', () => {
    const wrapper = mount(Checkbox, {
      props: { variant: 'error' }
    })
    const indicator = wrapper.find('div').find('div').find('div') // The custom indicator div
    expect(indicator.classes()).toContain('border-(--ui-danger-soft)')
  })

  it('emits change event', async () => {
    const wrapper = mount(Checkbox)
    const input = wrapper.find('input[type="checkbox"]')

    await input.setChecked(true)
    expect(wrapper.emitted('change')).toHaveLength(1)
  })
})