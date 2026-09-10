import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import FormField from '../components/FormField.vue'
import Input from '../components/Input.vue'

const mountField = (props = {}) => mount(FormField, {
  props,
  slots: { default: Input },
  global: { stubs: { Transition: false } }
})

describe('FormField accessibility integration', () => {
  it('connects its label, description, help text and required state to Input', () => {
    const wrapper = mountField({
      id: 'email',
      label: 'Email',
      description: 'Use your work address',
      helpText: 'We never share it',
      required: true,
      autocomplete: 'email',
      name: 'email'
    })
    const input = wrapper.get('input')

    expect(wrapper.get('label').attributes('for')).toBe('email')
    expect(input.attributes()).toMatchObject({
      id: 'email',
      required: '',
      autocomplete: 'email',
      name: 'email',
      'aria-describedby': 'email-description email-help'
    })
  })

  it('announces server errors and marks the nested input invalid', () => {
    const wrapper = mountField({ id: 'password', label: 'Password', serverError: 'Credentials are invalid' })
    const input = wrapper.get('input')
    const alert = wrapper.get('[role="alert"]')

    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe('password-error')
    expect(alert.attributes('aria-atomic')).toBe('true')
    expect(alert.text()).toContain('Credentials are invalid')
  })

  it('uses package-owned password icons and updates the nested input type', async () => {
    const wrapper = mountField({ id: 'password', type: 'password' })
    const toggle = wrapper.get('button[aria-label="Show password"]')

    expect(wrapper.find('font-awesome-icon').exists()).toBe(false)
    expect(wrapper.get('input').attributes('type')).toBe('password')
    await toggle.trigger('click')
    expect(wrapper.get('input').attributes('type')).toBe('text')
    expect(toggle.attributes('aria-label')).toBe('Hide password')
  })

  it('keeps generated IDs stable across reactive updates', async () => {
    const wrapper = mountField({ label: 'Name', helpText: 'Initial' })
    const initialId = wrapper.get('input').attributes('id')
    await wrapper.setProps({ helpText: 'Updated' })

    expect(wrapper.get('input').attributes('id')).toBe(initialId)
    expect(wrapper.get('label').attributes('for')).toBe(initialId)
  })
})
