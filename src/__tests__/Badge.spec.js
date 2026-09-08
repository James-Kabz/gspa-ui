import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Badge from '../components/Badge.vue'

// Mock Icon to avoid fontawesome dependency in unit tests
vi.mock('../components/Icon.vue', () => ({
  default: {
    name: 'Icon',
    props: ['name', 'class'],
    template: '<span :class="$attrs.class" data-testid="icon">{{ name }}</span>'
  }
}))

describe('Badge', () => {
  it('renders with default props', () => {
    const wrapper = mount(Badge)
    expect(wrapper.classes()).toContain('inline-flex')
    expect(wrapper.classes()).toContain('ui-primary-soft')
  })

  it('displays slot content', () => {
    const wrapper = mount(Badge, {
      slots: {
        default: 'Test Badge'
      }
    })
    expect(wrapper.text()).toBe('Test Badge')
  })

  it('applies variant classes', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'danger' }
    })
    expect(wrapper.classes()).toContain('ui-danger-soft')
  })

  it('applies primary variant classes', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'primary' }
    })
    expect(wrapper.classes()).toContain('ui-primary-soft')
  })

  it('applies success variant classes', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'success' }
    })
    expect(wrapper.classes()).toContain('ui-success-soft')
  })

  it('applies warning variant classes', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'warning' }
    })
    expect(wrapper.classes()).toContain('ui-warning-soft')
  })

  it('applies info variant classes', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'info' }
    })
    expect(wrapper.classes()).toContain('ui-primary-soft')
  })

  it('applies ghost variant classes', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'ghost' }
    })
    expect(wrapper.classes()).toContain('bg-transparent')
  })

  it('applies link variant classes', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'link' }
    })
    expect(wrapper.classes()).toContain('ui-primary')
  })

  it('applies subtle variant classes', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'subtle' }
    })
    expect(wrapper.classes()).toContain('ui-surface-muted')
  })

  it('applies dark variant classes', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'dark' }
    })
    expect(wrapper.classes()).toContain('ui-bg')
  })

  it('applies light variant classes', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'light' }
    })
    expect(wrapper.classes()).toContain('ui-surface-muted')
  })

  it('applies primaryOutline variant classes', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'primaryOutline' }
    })
    expect(wrapper.classes()).toContain('border-(--ui-primary)')
  })

  it('applies dangerOutline variant classes', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'dangerOutline' }
    })
    expect(wrapper.classes()).toContain('border-(--ui-danger)')
  })

  it('applies successOutline variant classes', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'successOutline' }
    })
    expect(wrapper.classes()).toContain('border-(--ui-success)')
  })

  it('applies gradient variant classes', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'gradient' }
    })
    expect(wrapper.classes()).toContain('bg-linear-to-r')
  })

  it('applies size classes', () => {
    const wrapper = mount(Badge, {
      props: { size: 'lg' }
    })
    expect(wrapper.classes()).toContain('px-3')
    expect(wrapper.classes()).toContain('py-1.5')
  })

  it('applies shape classes', () => {
    const wrapper = mount(Badge, {
      props: { shape: 'pill' }
    })
    expect(wrapper.classes()).toContain('rounded-full')
  })

  it('shows dismiss button when dismissible', () => {
    const wrapper = mount(Badge, {
      props: { dismissible: true }
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('emits dismiss event on dismiss button click', async () => {
    const wrapper = mount(Badge, {
      props: { dismissible: true }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('renders icon', () => {
    const wrapper = mount(Badge, {
      props: { icon: 'test-icon' }
    })
    // Icon is rendered via component tag, check if it exists
    expect(wrapper.html()).toContain('<test-icon')
  })

  it('applies custom class', () => {
    const wrapper = mount(Badge, {
      props: { class: 'custom-class' }
    })
    expect(wrapper.classes()).toContain('custom-class')
  })
})
