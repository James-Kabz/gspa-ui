import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Modal from '../components/Modal.vue'

// Mock the Icon component
vi.mock('../components/Icon.vue', () => ({
  default: {
    name: 'Icon',
    props: ['name', 'class'],
    template: '<span :class="$attrs.class" data-testid="icon">{{ name }}</span>'
  }
}))

describe('Modal', () => {
  it('renders when open', () => {
    const wrapper = mount(Modal, {
      global: {
        stubs: { Teleport: true }
      },
      props: { modelValue: true },
      slots: {
        default: 'Modal content'
      }
    })
    expect(wrapper.text()).toContain('Modal content')
  })

  it('does not render when closed', () => {
    const wrapper = mount(Modal, {
      props: { modelValue: false }
    })
    expect(wrapper.html()).not.toContain('Modal content')
  })

  it('emits close event on close button click', async () => {
    const wrapper = mount(Modal, {
      global: {
        stubs: { Teleport: true }
      },
      props: { modelValue: true, showClose: true }
    })
    const closeButton = wrapper.find('button[aria-label="Close"]')
    expect(closeButton.exists()).toBe(true)
    await closeButton.trigger('click')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
  })

  it('applies size classes', () => {
    const wrapper = mount(Modal, {
      global: {
        stubs: { Teleport: true }
      },
      props: { modelValue: true, size: 'lg' }
    })
    expect(wrapper.find('.relative').classes()).toContain('max-w-lg')
  })

  it('handles escape key', async () => {
    const wrapper = mount(Modal, {
      global: {
        stubs: { Teleport: true }
      },
      props: { modelValue: true },
      attachTo: document.body
    })

    // Give the watcher time to set up
    await new Promise(resolve => setTimeout(resolve, 0))
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])

    wrapper.unmount()
  })

  it('renders with resizable class when resizable', () => {
    const wrapper = mount(Modal, {
      global: {
        stubs: { Teleport: true }
      },
      props: { modelValue: true, resizable: true }
    })
    expect(wrapper.find('.relative').classes()).toContain('resize')
  })
})