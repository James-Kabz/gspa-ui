import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Modal from '../../components/Modal.vue'
import Input from '../../components/Input.vue'
import Button from '../../components/Button.vue'
import Alert from '../../components/Alert.vue'

// Mock Icon component
vi.mock('../../components/Icon.vue', () => ({
  default: {
    name: 'Icon',
    props: ['name', 'class'],
    template: '<span :class="$attrs.class" data-testid="icon">{{ name }}</span>'
  }
}))

describe('Modal Integration', () => {
  it('handles modal with form submission', async () => {
    let submittedData = null

    const TestModal = {
      components: { Modal, Input, Button },
      template: `
        <div>
          <Button @click="showModal = true">Open Modal</Button>
          <Modal v-model="showModal">
            <template #default>
              <h2>Create Account</h2>
              <form @submit.prevent="submitForm">
                <Input v-model="form.name" label="Name" required />
                <Input v-model="form.email" label="Email" type="email" required />
                <div class="flex gap-2 mt-4">
                  <Button type="button" variant="outline" @click="showModal = false">Cancel</Button>
                  <Button type="submit">Create</Button>
                </div>
              </form>
            </template>
          </Modal>
        </div>
      `,
      data() {
        return {
          showModal: false,
          form: { name: '', email: '' }
        }
      },
      methods: {
        submitForm() {
          submittedData = { ...this.form }
          this.showModal = false
        }
      }
    }

    const wrapper = mount(TestModal, { attachTo: document.body })

    // Open modal
    await wrapper.find('button').trigger('click')
    expect(wrapper.findComponent(Modal).props('modelValue')).toBe(true)

    // Fill form by setting data directly (since modal is teleported)
    wrapper.vm.form.name = 'John Doe'
    wrapper.vm.form.email = 'john@example.com'
    await wrapper.vm.$nextTick()

    // Submit form by clicking submit button
    // Find all buttons in document.body since modal is teleported
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const submitButton = buttons.find(btn => btn.textContent.includes('Create'))
    submitButton.click()
    await wrapper.vm.$nextTick()

    expect(submittedData).toEqual({ name: 'John Doe', email: 'john@example.com' })
    expect(wrapper.findComponent(Modal).props('modelValue')).toBe(false)
  })

  it('handles modal with alert and actions', async () => {
    let actionResult = null

    const TestModal = {
      components: { Modal, Alert, Button },
      template: `
        <div>
          <Button @click="showModal = true">Show Alert</Button>
          <Modal v-model="showModal">
            <Alert
              variant="warning"
              title="Confirm Action"
              message="Are you sure you want to delete this item?"
              :actions="[
                { label: 'Cancel', variant: 'outline', onClick: () => handleAction('cancel') },
                { label: 'Delete', variant: 'danger', onClick: () => handleAction('delete') }
              ]"
            />
          </Modal>
        </div>
      `,
      data() {
        return { showModal: false }
      },
      methods: {
        handleAction(action) {
          actionResult = action
          this.showModal = false
        }
      }
    }

    const wrapper = mount(TestModal, { attachTo: document.body })

    // Open modal
    await wrapper.find('button').trigger('click')
    expect(wrapper.findComponent(Modal).props('modelValue')).toBe(true)

    // Click delete action
    // Find all buttons in document.body since modal is teleported
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const deleteButton = buttons.find(btn => btn.textContent.includes('Delete'))
    deleteButton.click()
    await wrapper.vm.$nextTick()

    expect(actionResult).toBe('delete')
    expect(wrapper.findComponent(Modal).props('modelValue')).toBe(false)
  })

  it('handles modal keyboard interactions', async () => {
    const TestModal = {
      components: { Modal, Button },
      template: `
        <Modal v-model="showModal">
          <Button @click="showModal = false">Close</Button>
        </Modal>
      `,
      data() {
        return { showModal: true }
      }
    }

    const wrapper = mount(TestModal, { attachTo: document.body })

    // Modal should be open
    expect(wrapper.findComponent(Modal).props('modelValue')).toBe(true)

    // Press Escape
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    // Modal should close
    expect(wrapper.findComponent(Modal).props('modelValue')).toBe(false)
  })
})