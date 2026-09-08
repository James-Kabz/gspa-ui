<template>
  <div :class="layoutClasses">
    <!-- Background -->
    <div
      v-if="showBackground"
      :class="backgroundClasses"
    >
      <slot name="background">
        <div class="absolute inset-0 bg-linear-to-br from-(--ui-surface) to-(--ui-surface)" />
      </slot>
    </div>

    <!-- Content -->
    <div :class="contentClasses">
      <!-- Header/Logo -->
      <div
        v-if="$slots.header || showLogo"
        :class="headerClasses"
      >
        <slot name="header">
          <div class="flex justify-center">
            <slot name="logo">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 ui-primary-bg rounded-xl flex items-center justify-center">
                  <span class="ui-text font-bold text-lg">STL</span>
                </div>
                <span class="text-2xl font-bold ui-text">{{ brandName }}</span>
              </div>
            </slot>
          </div>
        </slot>
      </div>

      <!-- Error Content -->
      <div :class="errorContentClasses">
        <!-- Error Icon/Illustration -->
        <div
          v-if="$slots.illustration || showDefaultIllustration"
          :class="illustrationClasses"
        >
          <slot name="illustration">
            <div :class="iconContainerClasses">
              <div
                class="text-8xl"
                :style="{ color: errorConfig.color }"
              >
                {{ errorConfig.icon }}
              </div>
            </div>
          </slot>
        </div>

        <!-- Error Details -->
        <div :class="detailsClasses">
          <div
            v-if="errorCode"
            :class="codeClasses"
          >
            {{ errorCode }}
          </div>

          <h1 :class="titleClasses">
            <slot name="title">
              {{ title }}
            </slot>
          </h1>

          <p :class="messageClasses">
            <slot name="message">
              {{ message }}
            </slot>
          </p>
        </div>

        <!-- Network Status -->
        <div
          v-if="!isOnline"
          class="ui-danger-soft border border-(--ui-danger-soft) rounded-lg p-4 mx-auto max-w-md mb-6"
        >
          <div class="flex items-center justify-center gap-2 ui-danger">
            <span class="w-3 h-3 ui-danger-bg rounded-full animate-pulse" />
            <span class="font-medium">No Internet Connection</span>
          </div>
        </div>

        <!-- Actions -->
        <div
          v-if="$slots.actions || showDefaultActions"
          :class="actionsClasses"
        >
          <slot name="actions">
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                v-if="showHomeButton"
                class="ui-primary-bg ui-text px-6 py-3 rounded-lg font-medium hover:bg-(--ui-primary-strong) transition-colors flex items-center justify-center gap-2"
                @click="goHome"
              >
                <span>{{ homeButtonIcon }}</span>
                {{ homeButtonText }}
              </button>

              <button
                v-if="showBackButton"
                class="border ui-border-strong ui-text px-6 py-3 rounded-lg font-medium hover:bg-(--ui-surface) transition-colors flex items-center justify-center gap-2"
                @click="goBack"
              >
                <span>←</span>
                {{ backButtonText }}
              </button>

              <button
                v-if="showRetryButton"
                :disabled="isRetrying || !isOnline"
                class="border ui-border-strong ui-text px-6 py-3 rounded-lg font-medium hover:bg-(--ui-surface) transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="retry"
              >
                <span
                  v-if="isRetrying"
                  class="animate-spin"
                >↻</span>
                <span v-else>🔄</span>
                {{ isRetrying ? 'Retrying...' : retryButtonText }}
              </button>

              <button
                v-if="showSupportButton"
                :disabled="reportSent"
                class="ui-bg ui-text px-6 py-3 rounded-lg font-medium hover:bg-(--ui-bg) transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="$emit('contact-support')"
              >
                <span v-if="reportSent">✓</span>
                <span v-else>📝</span>
                {{ reportSent ? 'Report Sent' : 'Contact Support' }}
              </button>
            </div>
          </slot>
        </div>

        <!-- Additional Info Section -->
        <div
          v-if="$slots['additional-info'] || showAdditionalInfo"
          :class="additionalInfoClasses"
        >
          <slot name="additional-info">
            <div
              v-if="additionalInfoConfig"
              class="mt-8 max-w-md mx-auto"
            >
              <div class="  rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-semibold ui-text mb-4">
                  {{ additionalInfoConfig.title }}
                </h3>
                <ul class="space-y-3">
                  <li 
                    v-for="(item, index) in additionalInfoConfig.items" 
                    :key="index"
                    class="flex items-start gap-3 text-sm ui-text"
                  >
                    <span :class="`w-4 h-4 text-${item.iconColor || 'slate-400'} shrink-0 mt-0.5`">
                      {{ item.icon }}
                    </span>
                    <span>{{ item.text }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </slot>
        </div>

        <!-- Help Section -->
        <div
          v-if="$slots.help || helpText"
          :class="helpClasses"
        >
          <slot name="help">
            <p class="text-sm ui-text">
              {{ helpText }}
              <a
                v-if="supportUrl"
                :href="supportUrl"
                class="ui-primary hover:text-(--ui-primary) underline ml-1"
              >
                <span class="inline-block w-4 h-4 mr-1">❓</span>
                Get Help
              </a>
            </p>
          </slot>
        </div>

        <!-- Error ID for debugging -->
        <div
          v-if="isDev"
          class="text-xs ui-text font-mono mt-4"
        >
          Error ID: {{ errorId }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, getCurrentInstance, inject } from 'vue'

export default {
  name: 'ErrorLayout',
  props: {
    errorType: {
      type: [String, Number],
      default: '404'
    },
    errorCode: {
      type: [String, Number],
      default: null
    },
    errorTitle: {
      type: String,
      default: null
    },
    errorMessage: {
      type: String,
      default: null
    },
    brandName: {
      type: String,
      default: 'Software Technologies'
    },
    showLogo: {
      type: Boolean,
      default: true
    },
    showBackground: {
      type: Boolean,
      default: true
    },
    showDefaultIllustration: {
      type: Boolean,
      default: true
    },
    showDefaultActions: {
      type: Boolean,
      default: true
    },
    showHomeButton: {
      type: Boolean,
      default: true
    },
    showBackButton: {
      type: Boolean,
      default: true
    },
    showRetryButton: {
      type: Boolean,
      default: false
    },
    showSupportButton: {
      type: Boolean,
      default: false
    },
    showAdditionalInfo: {
      type: Boolean,
      default: false
    },
    homeUrl: {
      type: String,
      default: '/'
    },
    homeButtonText: {
      type: String,
      default: 'Go Home'
    },
    backButtonText: {
      type: String,
      default: 'Go Back'
    },
    retryButtonText: {
      type: String,
      default: 'Try Again'
    },
    helpText: {
      type: String,
      default: null
    },
    supportUrl: {
      type: String,
      default: null
    }
  },
  emits: ['retry', 'back', 'contact-support'],
  setup(props, { emit }) {
    // Safe router injection with fallback
    const instance = getCurrentInstance()
    const router = inject('$router', null) || instance?.appContext.app.config.globalProperties?.$router

    // State
    const isRetrying = ref(false)
    const reportSent = ref(false)
    const isOnline = ref(navigator.onLine)
    const errorId = ref(`err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    const isDev = ref(import.meta.env.DEV)

    // Network status monitoring
    const updateOnlineStatus = () => {
      isOnline.value = navigator.onLine
    }
    
    onMounted(() => {
      window.addEventListener('online', updateOnlineStatus)
      window.addEventListener('offline', updateOnlineStatus)
    })
    
    onUnmounted(() => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    })

    const errorConfigs = computed(() => {
      const configs = {
        '404': {
          title: 'Page Not Found',
          message: 'Sorry, we couldn\'t find the page you\'re looking for.',
          icon: '🔍',
          color: '#64748b',
          homeButtonIcon: '🏠',
          additionalInfo: {
            title: 'What can you do?',
            items: [
              { icon: '✓', iconColor: 'green-500', text: 'Check the URL for typos' },
              { icon: '✓', iconColor: 'green-500', text: 'Go back to the previous page' },
              { icon: '✓', iconColor: 'green-500', text: 'Visit our homepage' }
            ]
          }
        },
        '403': {
          title: 'Unauthorized Access',
          message: 'You are not authorized to view this page.',
          icon: '🚫',
          color: '#ef4444',
          homeButtonIcon: '🔐',
          additionalInfo: {
            title: 'Why am I seeing this?',
            items: [
              { icon: '⚠️', iconColor: 'yellow-500', text: 'You may need to log in to access this page' },
              { icon: '⚠️', iconColor: 'yellow-500', text: 'Your account might not have the required permissions' },
              { icon: '⚠️', iconColor: 'yellow-500', text: 'Contact support if you believe this is an error' }
            ]
          }
        },
        '401': {
          title: 'Authentication Required',
          message: 'You need to log in to access this resource.',
          icon: '🔐',
          color: '#f59e0b',
          homeButtonIcon: '🔐',
          additionalInfo: {
            title: 'How to proceed?',
            items: [
              { icon: '✓', iconColor: 'blue-500', text: 'Log in with your credentials' },
              { icon: '✓', iconColor: 'blue-500', text: 'Create an account if you don\'t have one' },
              { icon: '✓', iconColor: 'blue-500', text: 'Reset your password if you forgot it' }
            ]
          }
        },
        '500': {
          title: 'Internal Server Error',
          message: 'Something went wrong on our end. Please try again later.',
          icon: '🔧',
          color: '#ef4444',
          homeButtonIcon: '🏠',
          additionalInfo: {
            title: 'What happened?',
            items: [
              { icon: '⚠️', iconColor: 'red-500', text: 'Our servers are experiencing issues' },
              { icon: '⚠️', iconColor: 'red-500', text: 'The problem is temporary' },
              { icon: '⚠️', iconColor: 'red-500', text: 'Try refreshing the page or come back later' }
            ]
          }
        },
        '503': {
          title: 'Service Unavailable',
          message: 'The service is temporarily unavailable. Please try again later.',
          icon: '🔧',
          color: '#f59e0b',
          homeButtonIcon: '🏠',
          additionalInfo: {
            title: 'Service Status',
            items: [
              { icon: '⚠️', iconColor: 'amber-500', text: 'We\'re performing scheduled maintenance' },
              { icon: '⚠️', iconColor: 'amber-500', text: 'Normal service will resume shortly' },
              { icon: '⚠️', iconColor: 'amber-500', text: 'Check our status page for updates' }
            ]
          }
        },
        'network': {
          title: 'Network Error',
          message: 'Unable to connect to the server. Please check your internet connection.',
          icon: '📶',
          color: '#ef4444',
          homeButtonIcon: '🏠',
          additionalInfo: {
            title: 'Connection Issues',
            items: [
              { icon: '⚠️', iconColor: 'red-500', text: 'Check your internet connection' },
              { icon: '⚠️', iconColor: 'red-500', text: 'Try refreshing the page' },
              { icon: '⚠️', iconColor: 'red-500', text: 'Contact your network administrator' }
            ]
          }
        }
      }

      return configs[props.errorType] || configs['404']
    })

    const errorConfig = computed(() => errorConfigs.value)

    const title = computed(() => {
      return props.errorTitle || errorConfig.value.title
    })

    const message = computed(() => {
      return props.errorMessage || errorConfig.value.message
    })

    const homeButtonIcon = computed(() => {
      return errorConfig.value.homeButtonIcon || '🏠'
    })

    const additionalInfoConfig = computed(() => {
      return props.showAdditionalInfo ? errorConfig.value.additionalInfo : null
    })

    // Navigation functions with fallbacks
    const goHome = () => {
      if (router) {
        router.push(props.homeUrl)
      } else {
        window.location.href = props.homeUrl
      }
    }

    const goBack = () => {
      if (router && window.history.length > 1) {
        router.back()
      } else if (window.history.length > 1) {
        window.history.back()
      } else {
        goHome()
      }
      emit('back')
    }

    const retry = async () => {
      isRetrying.value = true
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate retry delay
        window.location.reload()
      } catch (error) {
        console.error('Retry failed:', error)
      } finally {
        isRetrying.value = false
      }
      emit('retry')
    }

    // Computed classes
    const layoutClasses = computed(() => [
      'min-h-screen relative flex items-center justify-center',
      'px-4 sm:px-6 lg:px-8'
    ])

    const backgroundClasses = computed(() => [
      'absolute inset-0 -z-10'
    ])

    const contentClasses = computed(() => [
      'w-full max-w-2xl mx-auto text-center'
    ])

    const headerClasses = computed(() => [
      'mb-8'
    ])

    const errorContentClasses = computed(() => [
      'space-y-8'
    ])

    const illustrationClasses = computed(() => [
      'flex justify-center mb-6'
    ])

    const iconContainerClasses = computed(() => [
      'w-32 h-32 flex items-center justify-center'
    ])

    const detailsClasses = computed(() => [
      'space-y-4'
    ])

    const codeClasses = computed(() => [
      'text-6xl font-bold ui-text mb-4'
    ])

    const titleClasses = computed(() => [
      'text-3xl font-bold ui-text'
    ])

    const messageClasses = computed(() => [
      'text-lg ui-text max-w-lg mx-auto'
    ])

    const actionsClasses = computed(() => [
      'mt-8'
    ])

    const additionalInfoClasses = computed(() => [
      'mt-8'
    ])

    const helpClasses = computed(() => [
      'mt-6'
    ])

    return {
      // State
      isRetrying,
      reportSent,
      isOnline,
      errorId,
      isDev,
      
      // Computed
      errorConfig,
      title,
      message,
      homeButtonIcon,
      additionalInfoConfig,
      
      // Methods
      goHome,
      goBack,
      retry,
      
      // Classes
      layoutClasses,
      backgroundClasses,
      contentClasses,
      headerClasses,
      errorContentClasses,
      illustrationClasses,
      iconContainerClasses,
      detailsClasses,
      codeClasses,
      titleClasses,
      messageClasses,
      actionsClasses,
      additionalInfoClasses,
      helpClasses
    }
  }
}
</script>
