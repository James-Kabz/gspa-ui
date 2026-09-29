import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Toast from '../components/Toast.vue'
import { toast } from '../lib/toast.js'

const wrappers = []

const mountToast = (props = {}) => {
  const wrapper = mount(Toast, {
    attachTo: document.body,
    props
  })
  wrappers.push(wrapper)
  return wrapper
}

afterEach(() => {
  toast.dismissAll()
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('Toast', () => {
  it('renders a compact success notification with a built-in icon', async () => {
    const wrapper = mountToast()

    toast.success('Profile saved.', {
      title: 'Profile updated',
      statusCode: 200,
      duration: 0
    })
    await wrapper.vm.$nextTick()

    const notification = document.querySelector('.kv-toast')
    expect(notification).not.toBeNull()
    expect(notification.classList).toContain('kv-toast--success')
    expect(notification.textContent).toContain('Profile updated')
    expect(notification.textContent).toContain('Profile saved.')
    expect(notification.querySelector('[data-toast-icon="success"]')).not.toBeNull()
    expect(notification.querySelector('[aria-label="HTTP status 200"]')?.textContent).toContain('200')
  })

  it('uses assertive announcements and the error icon for failures', async () => {
    const wrapper = mountToast()

    toast.error('Please try again.', {
      title: 'Request failed (500)',
      duration: 0
    })
    await wrapper.vm.$nextTick()

    const notification = document.querySelector('.kv-toast')
    expect(notification.getAttribute('aria-live')).toBe('assertive')
    expect(notification.getAttribute('aria-atomic')).toBe('true')
    expect(notification.querySelector('[data-toast-icon="error"]')).not.toBeNull()
  })

  it('dismisses a notification from its accessible close button', async () => {
    const wrapper = mountToast()

    toast.info('New account activity.', { duration: 0 })
    await wrapper.vm.$nextTick()

    const closeButton = document.querySelector('button[aria-label="Dismiss notification"]')
    expect(closeButton).not.toBeNull()
    closeButton.click()
    await wrapper.vm.$nextTick()

    expect(document.querySelector('.kv-toast')).toBeNull()
  })

  it('supports bottom placement and limits visible notifications', async () => {
    const wrapper = mountToast({ position: 'bottom-right', visibleToasts: 1 })

    toast.info('First', { duration: 0 })
    toast.success('Second', { duration: 0 })
    await wrapper.vm.$nextTick()

    expect(document.querySelector('.kv-toast-region--bottom-right')).not.toBeNull()
    expect(document.querySelector('.kv-toast-stack--bottom')).not.toBeNull()
    expect(document.querySelectorAll('.kv-toast')).toHaveLength(1)
  })
})
