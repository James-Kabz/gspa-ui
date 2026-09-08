import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ReusableForm from '../components/ReusableForm.vue'

vi.mock('../lib/toast', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('ReusableForm', () => {
  it('toggles password field visibility from the trailing button', async () => {
    const wrapper = mount(ReusableForm, {
      props: {
        entityName: 'auth-login',
        fields: [
          {
            name: 'password',
            label: 'Password',
            type: 'password',
            placeholder: 'Password',
          },
        ],
      },
      global: {
        stubs: {
          'font-awesome-icon': {
            props: ['icon'],
            template: '<span :data-icon="icon" />',
          },
          DatePicker: true,
          Textarea: true,
          Select: true,
          MultiSelect: true,
          Button: true,
          Label: true,
          FileUpload: true,
          Slider: true,
        },
      },
    })

    const input = wrapper.find('input[type="password"]')
    expect(input.exists()).toBe(true)

    await wrapper.find('button[aria-label="Show password"]').trigger('click')
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)

    await wrapper.find('button[aria-label="Hide password"]').trigger('click')
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })
})
