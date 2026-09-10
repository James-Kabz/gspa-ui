import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Input from '../components/Input.vue'

// Mock the Icon component
vi.mock('../components/Icon.vue', () => ({
  default: {
    name: 'Icon',
    props: ['name', 'class'],
    template: '<span :class="$attrs.class" data-testid="icon">{{ name }}</span>'
  }
}))

describe('Input', () => {
  it('renders with default props', () => {
    const wrapper = mount(Input)
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('accepts v-model', async () => {
    const wrapper = mount(Input, {
      props: { modelValue: 'test' }
    })
    const input = wrapper.find('input')
    expect(input.element.value).toBe('test')

    await input.setValue('updated')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['updated'])
  })

  it('shows placeholder', () => {
    const wrapper = mount(Input, {
      props: { placeholder: 'Enter text' }
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter text')
  })

  it('handles different types', () => {
    const wrapper = mount(Input, {
      props: { type: 'email' }
    })
    expect(wrapper.find('input').attributes('type')).toBe('email')
  })

  it('supports time type', () => {
    const wrapper = mount(Input, {
      props: { type: 'time' }
    })
    expect(wrapper.find('input').attributes('type')).toBe('time')
  })

  it('displays error state', () => {
    const wrapper = mount(Input, {
      props: { variant: 'error' }
    })
    const input = wrapper.find('input')
    expect(input.classes()).toContain('border-(--ui-danger)')
  })

  it('shows clear button when clearable and has value', async () => {
    const wrapper = mount(Input, {
      props: { modelValue: 'test', clearable: true }
    })
    const clearButton = wrapper.find('button[aria-label="Clear input"]')
    expect(clearButton.exists()).toBe(true)

    await clearButton.trigger('click')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([''])
  })

  it('emits focus and blur events', async () => {
    const wrapper = mount(Input)
    const input = wrapper.find('input')

    await input.trigger('focus')
    expect(wrapper.emitted('focus')).toHaveLength(1)

    await input.trigger('blur')
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  it('applies size classes', () => {
    const wrapper = mount(Input, {
      props: { size: 'lg' }
    })
    const input = wrapper.find('input')
    expect(input.classes()).toContain('px-4')
  })

  it('applies variant classes', () => {
    const wrapper = mount(Input, {
      props: { variant: 'success' }
    })
    const input = wrapper.find('input')
    expect(input.classes()).toContain('border-(--ui-success)')
  })

  it('renders and describes standalone server validation', () => {
    const wrapper = mount(Input, {
      props: { id: 'username', serverError: 'Username is already used', helpText: 'Choose a unique name' }
    })
    const input = wrapper.get('input')

    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe('username-error')
    expect(wrapper.get('[role="alert"]').text()).toBe('Username is already used')
  })

  it('supports browser form metadata and disabled behavior', () => {
    const wrapper = mount(Input, {
      props: { id: 'email', name: 'email', autocomplete: 'email', disabled: true, required: true }
    })

    expect(wrapper.get('input').attributes()).toMatchObject({
      name: 'email', autocomplete: 'email', disabled: '', required: ''
    })
  })
})
