import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Icon from '../components/Icon.vue'
import { ICON_ADAPTER_KEY } from '../lib/icon.js'

describe('Icon adapter', () => {
  it('renders a consumer component without global Font Awesome registration', () => {
    const wrapper = mount(Icon, {
      props: { name: 'academy-shield', ariaLabel: 'Academy shield' },
      global: {
        provide: {
          [ICON_ADAPTER_KEY]: ({ name }) => ({ template: `<svg data-icon="${name}" />` })
        }
      }
    })

    expect(wrapper.get('svg').attributes()).toMatchObject({
      'data-icon': 'academy-shield',
      'aria-label': 'Academy shield',
      role: 'img'
    })
  })
})
