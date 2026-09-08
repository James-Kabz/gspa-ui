import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Input from '../../components/Input.vue'
import Button from '../../components/Button.vue'
import Select from '../../components/Select.vue'
import Checkbox from '../../components/Checkbox.vue'

// Mock Icon component
vi.mock('../../components/Icon.vue', () => ({
  default: {
    name: 'Icon',
    props: ['name', 'class'],
    template: '<span :class="$attrs.class" data-testid="icon">{{ name }}</span>'
  }
}))

describe('Form Integration', () => {
  it('handles complete form submission with multiple inputs', async () => {
    const formData = { name: '', email: '', country: '', agree: false }
    let submittedData = null

    const TestForm = {
      components: { Input, Button, Select, Checkbox },
      template: `
        <form @submit.prevent="submitForm">
          <Input v-model="form.name" label="Name" required />
          <Input v-model="form.email" label="Email" type="email" required />
          <Select v-model="form.country">
            <option value="us">United States</option>
            <option value="ca">Canada</option>
          </Select>
          <Checkbox v-model="form.agree" label="I agree to terms" />
          <Button type="submit" :disabled="!isFormValid">Submit</Button>
        </form>
      `,
      data() {
        return { form: { ...formData } }
      },
      computed: {
        isFormValid() {
          return this.form.name && this.form.email && this.form.agree
        }
      },
      methods: {
        submitForm() {
          submittedData = { ...this.form }
        }
      }
    }

    const wrapper = mount(TestForm)

    // Fill form
    await wrapper.find('input[required]').setValue('John Doe')
    await wrapper.find('input[type="email"]').setValue('john@example.com')
    await wrapper.find('select').setValue('us')
    await wrapper.find('input[type="checkbox"]').setChecked(true)

    // Submit form
    await wrapper.find('form').trigger('submit')

    expect(submittedData).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
      country: 'us',
      agree: true
    })
  })

  it('shows validation states across form components', async () => {
    const TestForm = {
      components: { Input, Button },
      template: `
        <form>
          <Input v-model="name" variant="error" error="Name is required" />
          <Input v-model="email" variant="success" />
          <Button :disabled="!isValid">Submit</Button>
        </form>
      `,
      data() {
        return { name: '', email: 'test@example.com' }
      },
      computed: {
        isValid() {
          return this.name && this.email
        }
      }
    }

    const wrapper = mount(TestForm)

    // Check error styling
    const errorInput = wrapper.findAll('input')[0]
    expect(errorInput.classes()).toContain('border-(--ui-danger-soft)')

    // Check success styling
    const successInput = wrapper.findAll('input')[1]
    expect(successInput.classes()).toContain('border-(--ui-success-soft)')

    // Button should be disabled
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('handles form reset with multiple components', async () => {
    const TestForm = {
      components: { Input, Select, Checkbox, Button },
      template: `
        <form @reset.prevent="resetForm">
          <Input v-model="form.name" />
          <Select v-model="form.country">
            <option value="us">US</option>
          </Select>
          <Checkbox v-model="form.agree" />
          <Button type="reset">Reset</Button>
        </form>
      `,
      data() {
        return {
          form: { name: 'John', country: 'us', agree: true }
        }
      },
      methods: {
        resetForm() {
          this.form = { name: '', country: '', agree: false }
        }
      }
    }

    const wrapper = mount(TestForm)

    // Verify initial values
    expect(wrapper.find('input').element.value).toBe('John')
    expect(wrapper.find('select').element.value).toBe('us')
    expect(wrapper.find('input[type="checkbox"]').element.checked).toBe(true)

    // Reset form
    await wrapper.find('form').trigger('reset')

    // Verify reset values
    expect(wrapper.find('input').element.value).toBe('')
    expect(wrapper.find('select').element.value).toBe('')
    expect(wrapper.find('input[type="checkbox"]').element.checked).toBe(false)
  })
})