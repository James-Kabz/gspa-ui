<script setup>
import { computed, ref } from 'vue'
import { toast } from '../../lib/toast'
import Link from '../../components/Link.vue'
import ReusableForm from '../../components/ReusableForm.vue'

const isLoading = ref(false)
const showPassword = ref(false)

const loginFields = computed(() => [
  {
    name: 'email',
    label: 'Username',
    type: 'text',
    placeholder: 'Username',
    required: true
  },
  {
    name: 'password',
    label: 'Password',
    type: showPassword.value ? 'text' : 'password',
    placeholder: 'Password',
    required: true,
    trailingIcon: showPassword.value ? 'eye-slash' : 'eye',
    trailingIconTitle: showPassword.value ? 'Hide password' : 'Show password',
    trailingIconAriaLabel: showPassword.value ? 'Hide password' : 'Show password',
    trailingIconClass: 'w-4 h-4',
    onTrailingIconClick: () => {
      showPassword.value = !showPassword.value
    }
  },
  {
    name: 'companyCode',
    label: 'Company Code',
    type: 'text',
    placeholder: 'Company Code',
    required: true
  }
])

const onSubmit = async ({ formData }) => {
  if (isLoading.value) return

  const payload = {
    email: formData.email?.trim() ?? '',
    password: formData.password ?? '',
    companyCode: formData.companyCode?.trim() ?? ''
  }

  isLoading.value = true

  try {
    // Placeholder for real auth request
    await new Promise(resolve => setTimeout(resolve, 2000))

    toast.info('Sign in successful!', {
      description: `Welcome back ${payload.email}`,
    })
  } catch {
    toast.error('Sign in failed', {
      description: 'Please check your credentials and try again.',
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <ReusableForm
      title=""
      entity-name="auth-login"
      :fields="loginFields"
      :loading="isLoading"
      :show-reset="false"
      :show-cancel="false"
      submit-label="LOG IN"
      @submit="onSubmit"
    />

    <div class="flex justify-end pt-2">
      <Link
        href="/auth/forgot-password"
        class="text-[13px]"
      >
        Forgot Password ?
      </Link>
    </div>
  </div>
</template>
