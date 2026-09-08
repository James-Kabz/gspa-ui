import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../../components/Button.vue'
import Dropdown from '../../components/Dropdown.vue'
import Breadcrumb from '../../components/Breadcrumb.vue'

// Mock Icon component
vi.mock('../../components/Icon.vue', () => ({
  default: {
    name: 'Icon',
    props: ['name', 'class'],
    template: '<span :class="$attrs.class" data-testid="icon">{{ name }}</span>'
  }
}))

describe('Navigation Integration', () => {
  it('handles dropdown with navigation actions', async () => {
    let selectedAction = null

    const NavigationDropdown = {
      components: { Dropdown, Button },
      template: `
        <Dropdown trigger-text="Menu">
          <div class="p-2">
            <Button
              variant="ghost"
              class="w-full justify-start"
              @click="handleAction('profile')"
            >
              Profile
            </Button>
            <Button
              variant="ghost"
              class="w-full justify-start"
              @click="handleAction('settings')"
            >
              Settings
            </Button>
            <Button
              variant="ghost"
              class="w-full justify-start text-red-600"
              @click="handleAction('logout')"
            >
              Logout
            </Button>
          </div>
        </Dropdown>
      `,
      methods: {
        handleAction(action) {
          selectedAction = action
        }
      }
    }

    const wrapper = mount(NavigationDropdown)

    // Open dropdown
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)

    // Click profile action
    const buttons = wrapper.findAll('button')
    const profileButton = buttons.find(btn => btn.text().includes('Profile'))
    await profileButton.trigger('click')

    expect(selectedAction).toBe('profile')
  })

  it('renders breadcrumb navigation', () => {
    const BreadcrumbNav = {
      components: { Breadcrumb },
      template: `
        <nav aria-label="Breadcrumb">
          <Breadcrumb :items="breadcrumbItems" />
        </nav>
      `,
      data() {
        return {
          breadcrumbItems: [
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Vue Components' }
          ]
        }
      }
    }

    const wrapper = mount(BreadcrumbNav)

    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Products')
    expect(wrapper.text()).toContain('Vue Components')

    // Check accessibility
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Breadcrumb')
  })

  it('handles complex navigation with multiple dropdowns', async () => {
    const ComplexNav = {
      components: { Dropdown, Button },
      template: `
        <nav class="flex items-center gap-4">
          <Button variant="ghost">Dashboard</Button>

          <Dropdown trigger-text="Projects">
            <div class="p-2 w-48">
              <div class="px-2 py-1 text-sm font-medium text-gray-900">Recent Projects</div>
              <Button variant="ghost" class="w-full justify-start" size="sm">Project Alpha</Button>
              <Button variant="ghost" class="w-full justify-start" size="sm">Project Beta</Button>
              <hr class="my-2">
              <Button variant="ghost" class="w-full justify-start" size="sm">View All Projects</Button>
            </div>
          </Dropdown>

          <Dropdown trigger-text="Account">
            <div class="p-2 w-48">
              <div class="px-2 py-1 text-sm font-medium text-gray-900">John Doe</div>
              <Button variant="ghost" class="w-full justify-start" size="sm">Profile</Button>
              <Button variant="ghost" class="w-full justify-start" size="sm">Settings</Button>
              <hr class="my-2">
              <Button variant="ghost" class="w-full justify-start text-red-600" size="sm">Sign Out</Button>
            </div>
          </Dropdown>
        </nav>
      `
    }

    const wrapper = mount(ComplexNav)

    // Check main navigation items
    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.text()).toContain('Projects')
    expect(wrapper.text()).toContain('Account')

    // Open Projects dropdown
    const projectDropdown = wrapper.findAll('button').find(btn => btn.text().includes('Projects'))
    await projectDropdown.trigger('click')

    expect(wrapper.text()).toContain('Recent Projects')
    expect(wrapper.text()).toContain('Project Alpha')
    expect(wrapper.text()).toContain('Project Beta')

    // Open Account dropdown
    const accountDropdown = wrapper.findAll('button').find(btn => btn.text().includes('Account'))
    await accountDropdown.trigger('click')

    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('Profile')
    expect(wrapper.text()).toContain('Settings')
    expect(wrapper.text()).toContain('Sign Out')
  })

  it('handles responsive navigation behavior', async () => {
    const ResponsiveNav = {
      components: { Dropdown, Button },
      template: `
        <nav>
          <!-- Desktop navigation -->
          <div class="hidden md:flex items-center gap-4">
            <Button variant="ghost">Home</Button>
            <Button variant="ghost">About</Button>
            <Button variant="ghost">Contact</Button>
          </div>

          <!-- Mobile navigation -->
          <div class="md:hidden">
            <Dropdown trigger-text="Menu">
              <div class="p-2 w-48">
                <Button variant="ghost" class="w-full justify-start" size="sm">Home</Button>
                <Button variant="ghost" class="w-full justify-start" size="sm">About</Button>
                <Button variant="ghost" class="w-full justify-start" size="sm">Contact</Button>
              </div>
            </Dropdown>
          </div>
        </nav>
      `
    }

    const wrapper = mount(ResponsiveNav)

    // Check desktop navigation (hidden on mobile)
    const desktopNav = wrapper.find('.hidden.md\\:flex')
    expect(desktopNav.exists()).toBe(true)
    expect(desktopNav.text()).toContain('Home')
    expect(desktopNav.text()).toContain('About')
    expect(desktopNav.text()).toContain('Contact')

    // Check mobile navigation
    const mobileNav = wrapper.find('.md\\:hidden')
    expect(mobileNav.exists()).toBe(true)
    expect(mobileNav.text()).toContain('Menu')

    // Test mobile dropdown
    await mobileNav.find('button').trigger('click')
    expect(mobileNav.text()).toContain('Home')
    expect(mobileNav.text()).toContain('About')
    expect(mobileNav.text()).toContain('Contact')
  })
})