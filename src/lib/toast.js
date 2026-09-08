// lib/toast.js
import { ref, markRaw } from 'vue'

// Global state for toasts
const toasts = ref([])
let toastCounter = 0

// Default configuration
const defaultConfig = {
  duration: 3000,
  position: 'top-center',
  dismissible: true,
  closeButton: false
}

// Generate unique toast ID
const generateId = () => `toast-${++toastCounter}-${Date.now()}`

// Core toast function
const createToast = (message, options = {}) => {
  const id = generateId()
  
  const toast = {
    id,
    message,
    ...defaultConfig,
    ...options,
    createdAt: Date.now()
  }

  // Add to toasts array
  toasts.value.push(markRaw(toast))

  // Auto dismiss if duration is set
  if (toast.duration && toast.duration > 0) {
    setTimeout(() => {
      dismiss(id)
    }, toast.duration)
  }

  return id
}

// Remove toast by ID
const dismiss = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Clear all toasts
const dismissAll = () => {
  toasts.value = []
}

// Toast type functions (matching Sonner API)
const toast = Object.assign(
  // Default toast function
  (message, options) => createToast(message, { ...options }),
  
  // Toast type methods
  {
    success: (message, options) => createToast(message, { ...options, variant: 'success' }),
    error: (message, options) => createToast(message, { ...options, variant: 'error' }),
    warning: (message, options) => createToast(message, { ...options, variant: 'warning' }),
    info: (message, options) => createToast(message, { ...options, variant: 'info' }),
    
    // Promise toast for async operations
    promise: (promise, options = {}) => {
      const {
        loading = 'Loading...',
        success: successMessage = 'Success',
        error: errorMessage = 'Error',
        ...restOptions
      } = options

      // Show loading toast
      const loadingId = createToast(loading, {
        ...restOptions,
        variant: 'loading',
        duration: 0, // Don't auto dismiss
        dismissible: false
      })

      return promise
        .then((result) => {
          // Remove loading toast
          dismiss(loadingId)
          
          // Show success toast
          const message = typeof successMessage === 'function' 
            ? successMessage(result) 
            : successMessage
            
          createToast(message, {
            ...restOptions,
            variant: 'success'
          })
          
          return result
        })
        .catch((error) => {
          // Remove loading toast
          dismiss(loadingId)
          
          // Show error toast
          const message = typeof errorMessage === 'function' 
            ? errorMessage(error) 
            : errorMessage
            
          createToast(message, {
            ...restOptions,
            variant: 'error'
          })
          
          throw error
        })
    },
    
    // Utility methods
    dismiss,
    dismissAll,
    
    // Custom toast with component
    custom: (component, options = {}) => createToast('', { 
      ...options, 
      component: markRaw(component) 
    })
  }
)

// Composable for components that need access to toast state
export const useToaster = () => {
  return {
    toasts,
    dismiss,
    dismissAll
  }
}

// Main export - matches Sonner's import pattern
export { toast }