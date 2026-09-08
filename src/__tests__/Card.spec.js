import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Card from '../components/Card.vue'

describe('Card', () => {
  it('renders with default props', () => {
    const wrapper = mount(Card)
    expect(wrapper.classes()).toContain('ui-surface')
    expect(wrapper.classes()).toContain('ui-border-strong')
  })

  it('renders title and subtitle', () => {
    const wrapper = mount(Card, {
      props: { title: 'Test Title', subtitle: 'Test Subtitle' }
    })
    expect(wrapper.text()).toContain('Test Title')
    expect(wrapper.text()).toContain('Test Subtitle')
  })

  it('renders slots', () => {
    const wrapper = mount(Card, {
      slots: {
        header: 'Header Content',
        default: 'Body Content',
        footer: 'Footer Content'
      }
    })
    expect(wrapper.text()).toContain('Header Content')
    expect(wrapper.text()).toContain('Body Content')
    expect(wrapper.text()).toContain('Footer Content')
  })

  it('applies variant classes', () => {
    const wrapper = mount(Card, {
      props: { variant: 'elevated' }
    })
    expect(wrapper.classes()).toContain('shadow-md')
  })

  it('applies padding classes', () => {
    const wrapper = mount(Card, {
      props: { padding: 'lg' }
    })
    expect(wrapper.classes()).toContain('p-6')
  })

  it('applies hoverable class', () => {
    const wrapper = mount(Card, {
      props: { hoverable: true }
    })
    expect(wrapper.classes()).toContain('hover:shadow-lg')
  })

  it('applies clickable class', () => {
    const wrapper = mount(Card, {
      props: { clickable: true }
    })
    expect(wrapper.classes()).toContain('cursor-pointer')
  })

  it('emits click event when clickable', async () => {
    const wrapper = mount(Card, {
      props: { clickable: true }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('activates clickable card with Enter and Space when card has focus', async () => {
    const wrapper = mount(Card, {
      props: { clickable: true },
      attachTo: document.body
    })

    wrapper.element.focus()
    expect(document.activeElement).toBe(wrapper.element)

    await wrapper.trigger('keydown', { key: 'Enter' })
    await wrapper.trigger('keydown', { key: ' ' })

    expect(wrapper.emitted('click')).toHaveLength(2)
    wrapper.unmount()
  })

  it('does not block Space in nested input', async () => {
    const wrapper = mount(Card, {
      props: { clickable: true },
      slots: {
        default: '<input data-testid="nested-input" value="hello">'
      }
    })

    const nestedInput = wrapper.get('[data-testid="nested-input"]')
    const spaceEvent = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true
    })

    const notCanceled = nestedInput.element.dispatchEvent(spaceEvent)
    if (notCanceled && !spaceEvent.defaultPrevented) {
      nestedInput.element.value += ' '
      await nestedInput.trigger('input')
    }

    expect(spaceEvent.defaultPrevented).toBe(false)
    expect(nestedInput.element.value).toBe('hello ')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('applies loading state', () => {
    const wrapper = mount(Card, {
      props: { loading: true }
    })
    // Loading state is handled by the loading overlay, not by classes on the main element
    expect(wrapper.find('.absolute').exists()).toBe(true)
  })

  it('renders image', () => {
    const wrapper = mount(Card, {
      props: { image: 'test.jpg', imageAlt: 'Test image' }
    })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('test.jpg')
    expect(img.attributes('alt')).toBe('Test image')
  })
})
