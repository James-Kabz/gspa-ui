import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthLayout from '../layouts/AuthLayout.vue'

const mountLayout = (props = {}) => mount(AuthLayout, {
  props,
  global: {
    stubs: {
      Divider: true,
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

  it('renders page content from the default slot without Vue Router', () => {
    const wrapper = mount(AuthLayout, {
      props: { title: 'Sign in' },
      slots: { default: '<form data-testid="auth-form">Authentication form</form>' },
      global: { stubs: { Divider: true, Typography: { template: '<div><slot /></div>' } } }
    })

    expect(wrapper.get('[data-testid="auth-form"]').text()).toBe('Authentication form')
    expect(wrapper.find('router-view-stub').exists()).toBe(false)
  })

  it('uses an installed RouterView only when no default slot is supplied', () => {
    const wrapper = mount(AuthLayout, {
      global: {
        components: { RouterView: { template: '<main data-testid="route-page">Route page</main>' } },
        stubs: { Divider: true, Typography: { template: '<div><slot /></div>' } }
      }
    })

    expect(wrapper.get('[data-testid="route-page"]').text()).toBe('Route page')
  })

  it('keeps the authentication card usable at mobile widths', () => {
    const wrapper = mountLayout()
    const cardSection = wrapper.get('section.ml-auto')

    expect(cardSection.classes()).toContain('w-full')
    expect(cardSection.classes()).toContain('max-w-[460px]')
    expect(wrapper.get('section.hidden').classes()).toContain('lg:block')
  })
})
