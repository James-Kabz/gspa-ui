import DashboardLayout from '../layouts/DashboardLayout.vue'

const DashboardRoutes = {
  path: '/auth',
  component: DashboardLayout,
  // props: {
  //   companyInitials: 'STL',
  //   companyName: 'SOFTWARE',
  //   variant: 'centered',
  //   appName: 'eRisk & Compliance Management',
  //   appVersion: '1.0.0',
  //   secondaryLogoText: 'Risk & Compliance Management',
  //   backgroundOpacity: 1
  // },
  meta: { requiresAuth: false },
  children: [
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardPage.vue')
    },
    {
      path: '/analytics',
      name: 'dashboard/analytics',
      component: () => import('../views/AnalyticsPage.vue')
    },
  ]
}


export default DashboardRoutes
