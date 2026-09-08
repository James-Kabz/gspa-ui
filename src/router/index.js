import { createRouter, createWebHistory } from 'vue-router'
import AuthRoutes from './AuthRoutes'
import DashboardRoutes from './DashboardRoutes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/components/getting-started'
    },
    {
      path: '/components',
      component: () => import('../views/docs/DocsLayout.vue'),
      children: [
        {
          path: '',
          redirect: '/components/getting-started'
        },
        {
          path: 'getting-started',
          name: 'docs.getting-started',
          component: () => import('../views/docs/pages/GettingStartedPage.vue')
        },
        {
          path: 'installation',
          name: 'docs.installation',
          component: () => import('../views/docs/pages/InstallationPage.vue')
        },
        {
          path: 'theming',
          name: 'docs.theming',
          component: () => import('../views/docs/pages/ThemingPage.vue')
        },
        {
          path: 'components',
          name: 'docs.components',
          alias: ['/showcase', '/components-showcase'],
          component: () => import('../views/docs/pages/ComponentsPage.vue')
        },
        {
          path: 'components/:componentSlug',
          name: 'docs.component-detail',
          alias: ['/showcase/:componentSlug', '/components-showcase/:componentSlug'],
          component: () => import('../views/docs/pages/ComponentDetailPage.vue')
        },
        {
          path: 'full-gallery',
          name: 'docs.full-gallery',
          component: () => import('../views/docs/pages/FullGalleryPage.vue')
        },
        {
          path: 'support',
          name: 'docs.support',
          component: () => import('../views/docs/pages/SupportPage.vue')
        }
      ]
    },
    {
      path: '/templates/overview',
      name: 'templates/overview',
      component: () => import('../views/templates/DashboardOverview.vue')
    },
    {
      path: '/templates/analytics',
      name: 'templates/analytics',
      component: () => import('../views/templates/DashboardAnalytics.vue')
    },
    {
      path: '/templates/users',
      name: 'templates/users',
      component: () => import('../views/templates/DashboardUsers.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardPage.vue')
    },
    {
      path: '/dashboard/analytics',
      name: 'dashboard/analytics',
      component: () => import('../views/AnalyticsPage.vue')
    },
    {
      path: '/table',
      name: 'table',
      component: () => import('../views/DataTableTest.vue')
    },
    {
      path: '/widgets-test',
      name: 'widgets-test',
      component: () => import('../views/WidgetsTest.vue')
    },
    AuthRoutes,
    DashboardRoutes
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  }
})


export default router
