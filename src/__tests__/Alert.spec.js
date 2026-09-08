import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Alert from '../components/Alert.vue'

describe('Alert', () => {
  it('renders with default props', () => {
    const wrapper = mount(Alert)
    const alertDiv = wrapper.find('[role="alert"]')
    expect(alertDiv.exists()).toBe(true)
  })

  it('displays title and message', () => {
    const wrapper = mount(Alert, {
      props: { title: 'Test Title', message: 'Test message' }
    })
    expect(wrapper.text()).toContain('Test Title')
    expect(wrapper.text()).toContain('Test message')
  })

  it('renders slot content', () => {
    const wrapper = mount(Alert, {
      slots: {
        default: 'Custom content'
      }
    })
    expect(wrapper.text()).toContain('Custom content')
  })

  it('applies variant classes', () => {
    const wrapper = mount(Alert, {
      props: { variant: 'success' }
    })
    const alertDiv = wrapper.find('[role="alert"]')
    expect(alertDiv.classes()).toContain('ui-success-soft')
    expect(alertDiv.classes()).toContain('ui-success')
    expect(alertDiv.classes()).toContain('border')
  })

  it('shows icon by default', () => {
    const wrapper = mount(Alert)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('hides icon when showIcon is false', () => {
    const wrapper = mount(Alert, {
      props: { showIcon: false }
    })
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  it('shows dismiss button when dismissible', () => {
    const wrapper = mount(Alert, {
      props: { dismissible: true }
    })
    expect(wrapper.find('button[aria-label="Dismiss alert"]').exists()).toBe(true)
  })

  it('emits dismiss event on dismiss button click', async () => {
    const wrapper = mount(Alert, {
      props: { dismissible: true }
    })
    await wrapper.find('button[aria-label="Dismiss alert"]').trigger('click')
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('renders actions', () => {
    const wrapper = mount(Alert, {
      props: {
        actions: [{ label: 'Action 1' }, { label: 'Action 2' }]
      }
    })
    expect(wrapper.text()).toContain('Action 1')
    expect(wrapper.text()).toContain('Action 2')
  })

  it('emits action event on action click', async () => {
    const wrapper = mount(Alert, {
      props: {
        actions: [{ label: 'Test Action' }]
      }
    })
    const actionButton = wrapper.find('button')
    await actionButton.trigger('click')
    expect(wrapper.emitted('action')).toHaveLength(1)
  })

  it('auto closes after delay', async () => {
    vi.useFakeTimers()
    const wrapper = mount(Alert, {
      props: { autoClose: 1000 }
    })
    vi.advanceTimersByTime(1000)
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
    vi.useRealTimers()
  })
})
