import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthLayout from '../layouts/AuthLayout.vue'

const mountLayout = (props = {}) => mount(AuthLayout, {
  props,
  global: {
    stubs: {
      Divider: true,
      RouterView: true,
      Typography: {
        template: '<div><slot /></div>'
      }
    }
  }
})

describe('AuthLayout', () => {
  afterEach(() => {
    document.documentElement.classList.remove('auth-page')
    document.body.classList.remove('auth-page')
  })

  it('does not request consumer-root branding assets by default', () => {
    const wrapper = mountLayout()

    expect(wrapper.findAll('img')).toHaveLength(0)
    expect(wrapper.find('.bg-cover').attributes('style')).not.toContain('url(')
  })

  it('renders consumer-provided assets and applies background opacity', () => {
    const wrapper = mountLayout({
      appName: 'Example app',
      logoUrl: 'https://cdn.example.com/app.svg',
      secondaryLogoUrl: 'https://cdn.example.com/partner.svg',
      secondaryLogoAlt: 'Example partner',
      backgroundImage: 'https://cdn.example.com/background.jpg',
      backgroundOpacity: 0.35
    })

    const logos = wrapper.findAll('img')
    expect(logos).toHaveLength(2)
    expect(logos[0].attributes()).toMatchObject({
      src: 'https://cdn.example.com/app.svg',
      alt: 'Example app logo'
    })
    expect(logos[1].attributes()).toMatchObject({
      src: 'https://cdn.example.com/partner.svg',
      alt: 'Example partner'
    })
    expect(wrapper.find('.bg-cover').attributes('style')).toContain('opacity: 0.35')
  })

  it('clamps background opacity to the valid CSS range', () => {
    const wrapper = mountLayout({ backgroundOpacity: 4 })

    expect(wrapper.find('.bg-cover').attributes('style')).toContain('opacity: 1')
  })
})
