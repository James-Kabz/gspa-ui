import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Card from '../../components/Card.vue'
import Button from '../../components/Button.vue'
import Badge from '../../components/Badge.vue'

// Mock Icon component
vi.mock('../../components/Icon.vue', () => ({
  default: {
    name: 'Icon',
    props: ['name', 'class'],
    template: '<span :class="$attrs.class" data-testid="icon">{{ name }}</span>'
  }
}))

describe('Card Integration', () => {
  it('renders card with header, content, and actions', () => {
    const TestCard = {
      components: { Card, Button, Badge },
      template: `
        <Card>
          <template #header>
            <div class="flex items-center justify-between">
              <h3>Project Title</h3>
              <Badge variant="success">Active</Badge>
            </div>
          </template>

          <p>This is the main content of the card.</p>
          <p>It can contain multiple paragraphs and elements.</p>

          <template #footer>
            <div class="flex gap-2">
              <Button variant="outline" size="sm">Cancel</Button>
              <Button size="sm">Save</Button>
            </div>
          </template>
        </Card>
      `
    }

    const wrapper = mount(TestCard)

    // Check header content
    expect(wrapper.text()).toContain('Project Title')
    expect(wrapper.text()).toContain('Active')

    // Check main content
    expect(wrapper.text()).toContain('This is the main content')

    // Check footer actions
    expect(wrapper.text()).toContain('Cancel')
    expect(wrapper.text()).toContain('Save')
  })

  it('handles clickable card with event emission', async () => {
    let clickCount = 0

    const TestCard = {
      components: { Card },
      template: `
        <Card clickable @click="handleClick">
          <h3>Clickable Card</h3>
          <p>Click me to trigger an action</p>
        </Card>
      `,
      methods: {
        handleClick() {
          clickCount++
        }
      }
    }

    const wrapper = mount(TestCard)

    // Card should have cursor pointer
    expect(wrapper.classes()).toContain('cursor-pointer')

    // Click the card
    await wrapper.trigger('click')
    expect(clickCount).toBe(1)

    // Click again
    await wrapper.trigger('click')
    expect(clickCount).toBe(2)
  })

  it('applies different card variants and padding', () => {
    const TestCards = {
      components: { Card },
      template: `
        <div>
          <Card variant="outlined" padding="sm">
            <p>Outlined card with small padding</p>
          </Card>

          <Card variant="elevated" padding="lg" hoverable>
            <p>Elevated card with large padding and hover effect</p>
          </Card>

          <Card variant="filled" padding="xl">
            <p>Filled card with extra large padding</p>
          </Card>
        </div>
      `
    }

    const wrapper = mount(TestCards)
    const cards = wrapper.findAllComponents(Card)

    // Check variants
    expect(cards[0].classes()).toContain('border-2')
    expect(cards[0].classes()).toContain('ui-border-strong')
    expect(cards[1].classes()).toContain('shadow-md')
    expect(cards[2].classes()).toContain('ui-surface-soft')

    // Check padding (approximate checks)
    expect(cards[0].classes()).toContain('p-3') // sm padding
    expect(cards[1].classes()).toContain('p-6') // lg padding
    expect(cards[2].classes()).toContain('p-8') // xl padding

    // Check hoverable
    expect(cards[1].classes()).toContain('hover:shadow-lg')
  })

  it('handles card with image and complex content', () => {
    const TestCard = {
      components: { Card, Button, Badge },
      template: `
        <Card>
          <template #image>
            <img src="project-image.jpg" alt="Project" class="w-full h-48 object-cover" />
          </template>

          <template #header>
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-lg font-semibold">Featured Project</h3>
                <p class="text-sm text-gray-600">By John Doe</p>
              </div>
              <Badge variant="secondary">New</Badge>
            </div>
          </template>

          <p class="text-gray-700 mb-4">
            This project showcases advanced integration of multiple components
            within a card layout, demonstrating responsive design and accessibility.
          </p>

          <div class="flex items-center gap-2 mb-4">
            <Badge variant="outline">React</Badge>
            <Badge variant="outline">Vue</Badge>
            <Badge variant="outline">TypeScript</Badge>
          </div>

          <template #footer>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <span>⭐ 42</span>
                <span>💬 8</span>
              </div>
              <div class="flex gap-2">
                <Button variant="ghost" size="sm">View</Button>
                <Button size="sm">Edit</Button>
              </div>
            </div>
          </template>
        </Card>
      `
    }

    const wrapper = mount(TestCard)

    // Check image
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Project')

    // Check complex content structure
    expect(wrapper.text()).toContain('Featured Project')
    expect(wrapper.text()).toContain('By John Doe')
    expect(wrapper.text()).toContain('New')
    expect(wrapper.text()).toContain('React')
    expect(wrapper.text()).toContain('Vue')
    expect(wrapper.text()).toContain('TypeScript')
    expect(wrapper.text()).toContain('⭐ 42')
    expect(wrapper.text()).toContain('View')
    expect(wrapper.text()).toContain('Edit')
  })
})
