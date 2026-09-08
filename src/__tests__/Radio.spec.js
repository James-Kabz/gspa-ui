import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Radio from '../components/Radio.vue'

describe('Radio', () => {
  it('renders with default props', () => {
    const wrapper = mount(Radio, {
      props: { value: 'option1' }
    })
    expect(wrapper.find('button[role="radio"]').exists()).toBe(true)
  })

  it('accepts v-model', async () => {
    const wrapper = mount(Radio, {
      props: { modelValue: 'option1', value: 'option1' }
    })
    const button = wrapper.find('button')
    expect(button.attributes('aria-checked')).toBe('true')

    await button.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
  })

  it('is not selected when modelValue differs', () => {
    const wrapper = mount(Radio, {
      props: { modelValue: 'option1', value: 'option2' }
    })
    const button = wrapper.find('button')
    expect(button.attributes('aria-checked')).toBe('false')
  })

  it('displays label', () => {
    const wrapper = mount(Radio, {
      props: { label: 'Test Option' , value: 'option1' }
    })
    expect(wrapper.text()).toContain('Test Option')
  })

  it('label click selects radio', async () => {
    const wrapper = mount(Radio, {
      props: { value: 'option1', label: 'Test Option' }
    })
    const label = wrapper.find('label')
    expect(label.exists()).toBe(true)
    await label.trigger('click')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['option1'])
  })

  it('applies disabled state', () => {
    const wrapper = mount(Radio, {
      props: { disabled: true , value: 'option1' }
    })
    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.classes()).toContain('cursor-not-allowed')
  })

  it('does not emit when disabled', async () => {
    const wrapper = mount(Radio, {
      props: { disabled: true, value: 'option1' }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('applies size classes', () => {
    const wrapper = mount(Radio, {
      props: { size: 'lg', value: 'option1' }
    })
    const button = wrapper.find('button')
    expect(button.classes()).toContain('h-6')
  })

  it('has correct ARIA attributes', () => {
    const wrapper = mount(Radio, {
      props: { modelValue: 'option1', value: 'option1' }
    })
    const button = wrapper.find('button')
    expect(button.attributes('role')).toBe('radio')
    expect(button.attributes('aria-checked')).toBe('true')
  })
})