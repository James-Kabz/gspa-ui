import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Dropdown from '../components/Dropdown.vue'

// Mock the Icon component
vi.mock('../components/Icon.vue', () => ({
  default: {
    name: 'Icon',
    props: ['name', 'class'],
    template: '<span :class="$attrs.class" data-testid="icon">{{ name }}</span>'
  }
}))

describe('Dropdown', () => {
  it('renders with default props', () => {
    const wrapper = mount(Dropdown)
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.text()).toContain('Options')
  })

  it('displays custom trigger text', () => {
    const wrapper = mount(Dropdown, {
      props: { triggerText: 'Custom Text' }
    })
    expect(wrapper.text()).toContain('Custom Text')
  })

  it('renders trigger slot', () => {
    const wrapper = mount(Dropdown, {
      slots: {
        trigger: 'Custom Trigger'
      }
    })
    expect(wrapper.text()).toContain('Custom Trigger')
  })

  it('toggles dropdown on button click', async () => {
    const wrapper = mount(Dropdown)
    const button = wrapper.find('button')

    expect(wrapper.find('[role="menu"]').exists()).toBe(false)

    await button.trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)

    await button.trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })

  it('has correct ARIA attributes', () => {
    const wrapper = mount(Dropdown)
    const button = wrapper.find('button')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(button.attributes('aria-haspopup')).toBe('true')
  })

  it('updates aria-expanded when opened', async () => {
    const wrapper = mount(Dropdown)
    const button = wrapper.find('button')

    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('true')
  })
})