import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Tab from '../components/Tab.vue'
import TabPanel from '../components/TabPanel.vue'

// Mock TabPanel component
vi.mock('../components/TabPanel.vue', () => ({
  default: {
    name: 'TabPanel',
    props: ['label'],
    template: '<div>{{ label }}</div>'
  }
}))

describe('Tabs', () => {
  it('renders with default props', () => {
    const wrapper = mount(Tab, {
      global: {
        components: { TabPanel }
      },
      slots: {
        default: '<TabPanel label="Tab 1">Content 1</TabPanel><TabPanel label="Tab 2">Content 2</TabPanel>'
      }
    })
    expect(wrapper.text()).toContain('Tab 1')
    expect(wrapper.text()).toContain('Tab 2')
  })

  it('applies loading state', async () => {
    const wrapper = mount(Tab, {
      global: {
        components: { TabPanel }
      },
      props: { loading: true },
      slots: {
        default: '<TabPanel label="Tab 1">Content 1</TabPanel>'
      }
    })
    await nextTick()

    expect(wrapper.props('loading')).toBe(true)

    const mainDiv = wrapper.find('[role="tablist"]')
    expect(mainDiv.exists()).toBe(true)
  })

  it('has correct structure', () => {
    const wrapper = mount(Tab, {
      global: {
        components: { TabPanel }
      },
      slots: {
        default: '<TabPanel label="Tab 1">Content 1</TabPanel>'
      }
    })
    expect(wrapper.find('div').exists()).toBe(true) // Main container
    expect(wrapper.find('div').find('div').exists()).toBe(true) // Tab headers container
  })
})