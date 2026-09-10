import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../components/Button.vue'
import { AUTH_RESOLVER_KEY } from '../lib/auth.js'

describe('Button', () => {
  it('renders with default props', () => {
    const wrapper = mount(Button)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('supports native submit and reset button types', () => {
    expect(mount(Button, { props: { type: 'submit' } }).attributes('type')).toBe('submit')
    expect(mount(Button, { props: { type: 'reset' } }).attributes('type')).toBe('reset')
  })

  it('announces its loading state', () => {
    const wrapper = mount(Button, { props: { loading: true, loadingLabel: 'Saving changes' } })
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.get('[role="status"]').text()).toBe('Saving changes')
    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
  })

  it('applies variant class', () => {
    const wrapper = mount(Button, {
      props: { variant: 'primaryOutline' }
    })
    expect(wrapper.classes()).toContain('border-(--ui-primary)')
  })

  it('emits click event', async () => {
    const wrapper = mount(Button)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('displays slot content', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me'
      }
    })
    expect(wrapper.text()).toBe('Click me')
  })

  it('hides button when unauthorized mode is hide', () => {
    const wrapper = mount(Button, {
      props: {
        permission: 'users.create',
        unauthorized: 'hide'
      },
      global: {
        provide: {
          [AUTH_RESOLVER_KEY]: () => false
        }
      }
    })

    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('disables button when unauthorized mode is disable', () => {
    const wrapper = mount(Button, {
      props: {
        permission: 'users.create',
        unauthorized: 'disable'
      },
      global: {
        provide: {
          [AUTH_RESOLVER_KEY]: () => false
        }
      }
    })

    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('passes permission and role to auth resolver', () => {
    let payload = null
    const wrapper = mount(Button, {
      props: {
        permission: ['users.create', 'users.update'],
        role: ['admin', 'super-admin'],
        requireAll: true,
        unauthorized: 'disable'
      },
      global: {
        provide: {
          [AUTH_RESOLVER_KEY]: (params) => {
            payload = params
            return true
          }
        }
      }
    })

    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
    expect(payload).toEqual({
      permission: ['users.create', 'users.update'],
      role: ['admin', 'super-admin'],
      requireAll: true
    })
  })
})
