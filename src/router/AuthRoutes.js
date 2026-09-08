import AuthLayout from '../layouts/AuthLayout.vue'

const AuthRoutes = {
  path: '/auth',
  component: AuthLayout,
  props: {
    companyInitials: 'STL',
    companyName: 'SOFTWARE',
    variant: 'centered',
    appName: 'applogo',
    appVersion: '0.0.1',
    title: 'Login to your account:',
    logoUrl: '/applogo.png',
    secondaryLogoText: 'Risk & Compliance Management',
    backgroundOpacity: 1,
    backgroundImage: '/stlbacklogo.jpeg'
  },
  meta: { requiresAuth: false },
  children: [
    {
      path: '',
      redirect: { name: 'login' }
    },
    {
      name: 'login',
      path: 'login',
      alias: ['/login'],
      component: () => import('../views/authentication/LoginPage.vue')
    },
    {
      name: 'forgot-password',
      path: 'forgot-password',
      component: () => import('../views/authentication/ForgotPasswordPage.vue')
    }
  ]
}


export default AuthRoutes
