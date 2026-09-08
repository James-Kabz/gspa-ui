<template>
  <DashboardLayout
    app-name="Demo App"
    page-title="Dashboard Overview"
    :navigation="navigationItems"
    :user="currentUser"
    :profile-menu-items="profileMenuItems"
    @sidebar-toggle="onSidebarToggle"
    @profile-menu-click="onProfileMenuClick"
  >
    <!-- Custom logo -->
    <template #logo>
      <div class="w-8 h-8 bg-linear-to-br from-(--ui-primary) to-(--ui-accent) rounded-lg flex items-center justify-center">
        <span class="ui-text font-bold text-sm">D</span>
      </div>
    </template>

    <!-- Header right content -->
    <template #header-right>
      <button class="p-2 rounded-lg ui-text hover:bg-(--ui-surface) relative">
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 17h5l-5-5 5-5h-5m-6 10v-2a3 3 0 10-6 0v2h6z"
          />
        </svg>
        <span class="absolute top-0 right-0 w-2 h-2 ui-danger-bg rounded-full" />
      </button>
    </template>

    <!-- Main content -->
    <div class="space-y-6">
      <div class="ui-surface rounded-lg p-6 shadow-sm border ui-border-strong">
        <h2 class="text-2xl font-bold ui-text mb-4">
          Welcome to Dashboard
        </h2>
        <p class="ui-text">
          This is a demo of the Vue Dashboard Layout package. The sidebar can be collapsed,
          and all components are fully customizable through props and slots.
        </p>
        
        <div class="mt-6 p-4 ui-primary-soft rounded-lg">
          <h3 class="font-semibold ui-primary mb-2">
            Features:
          </h3>
          <ul class="ui-primary space-y-1">
            <li>• Responsive design with mobile support</li>
            <li>• Collapsible sidebar with smooth transitions</li>
            <li>• Customizable through props and slots</li>
            <li>• No hardcoded data - fully configurable</li>
            <li>• TypeScript ready</li>
          </ul>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script>
import { ref, h } from 'vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'

// Mock icon components for demo
const ChartIcon = {
  render() {
    return h('svg', {
      class: 'w-5 h-5',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
      })
    ])
  }
}

export default {
  name: 'Demo',
  components: {
    DashboardLayout
  },
  setup() {
    const navigationItems = ref([
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '#',
        icon: ChartIcon,
        active: true,
        onClick: (event) => console.log('Dashboard clicked', event)
      },
      { 
        id: 'analytics', 
        label: 'Analytics', 
        href: '#', 
        icon: ChartIcon,
        props: {
            to: '/dashboard/analytics'
        }, 
        active: true,
      }
    ])

    const currentUser = ref({
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    })

    const profileMenuItems = ref([
      { id: 'profile', label: 'Profile', href: '#profile' },
      { id: 'settings', label: 'Settings', href: '#settings' },
      { id: 'divider', component: 'hr', props: { class: 'my-1' } },
      { 
        id: 'logout', 
        label: 'Sign out', 
        danger: true,
        onClick: () => console.log('Logging out...')
      }
    ])

    const onSidebarToggle = (collapsed) => {
      console.log('Sidebar toggled:', collapsed)
    }

    const onProfileMenuClick = (item, event) => {
      console.log('Profile menu item clicked:', item.label, event)
    }

    return {
      navigationItems,
      currentUser,
      profileMenuItems,
      onSidebarToggle,
      onProfileMenuClick
    }
  }
}
</script>

