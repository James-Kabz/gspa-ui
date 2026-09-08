<script setup>
import { ref } from 'vue'
import Typography from '../../components/Typography.vue'
import Button from '../../components/Button.vue'
import Link from '../../components/Link.vue'
import ReusableForm from '../../components/ReusableForm.vue'

const isLoading = ref(false)
const isSubmitted = ref(false)
const submittedEmail = ref('')
const submitError = ref('')

const forgotPasswordFields = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter your email address',
    required: true
  },
  {
    name: 'companyCode',
    label: 'Company Code',
    type: 'text',
    placeholder: 'Enter your company code',
    required: true
  }
]

const onSubmit = async ({ formData }) => {
  submitError.value = ''
  isLoading.value = true

  try {
    console.log('Password reset requested:', {
      email: formData.email,
      companyCode: formData.companyCode
    })

    await new Promise(resolve => setTimeout(resolve, 1500))

    submittedEmail.value = formData.email
    isSubmitted.value = true
  } catch (error) {
    console.error('Password reset failed:', error)
    submitError.value = 'Failed to send reset email. Please try again.'
  }

  isLoading.value = false
}

const handleTryAgain = () => {
  isSubmitted.value = false
  submitError.value = ''
}
</script>

<template>
  <div class="w-full max-w-sm space-y-6">
    <!-- Header -->
    <div class="text-center space-y-2">
      <Typography
        variant="display-sm"
        class="ui-text"
      >
        Forgot Password?
      </Typography>
      <Typography
        variant="body-sm"
        class="ui-text"
      >
        Enter your email and company code to receive a password reset link.
      </Typography>
    </div>

    <!-- Success Message -->
    <div
      v-if="isSubmitted"
      class="text-center space-y-4"
    >
      <div class="mx-auto w-12 h-12 ui-success-soft rounded-full flex items-center justify-center">
        <svg
          class="w-6 h-6 ui-success"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <div class="space-y-2">
        <Typography
          variant="text-sm"
          class="ui-text font-semibold"
        >
          Reset Link Sent!
        </Typography>
        <Typography
          variant="body-sm"
          class="ui-text"
        >
          We've sent a password reset link to {{ submittedEmail }}. Please check your email and follow the instructions.
        </Typography>
      </div>

      <div class="pt-4 space-y-3">
        <Typography
          variant="body-sm"
          class="ui-text"
        >
          Didn't receive the email? Check your spam folder or try again.
        </Typography>

        <Button
          variant="default"
          size="sm"
          class="mx-auto"
          @click="handleTryAgain"
        >
          Try Again
        </Button>
      </div>
    </div>

    <!-- Form -->
    <div
      v-else
      class="space-y-6"
    >
      <ReusableForm
        title=""
        entity-name="forgot-password"
        :fields="forgotPasswordFields"
        :loading="isLoading"
        :show-reset="false"
        :show-cancel="false"
        submit-label="Send Reset Link"
        @submit="onSubmit"
      />
      <Typography
        v-if="submitError"
        variant="body-sm"
        class="ui-danger"
      >
        {{ submitError }}
      </Typography>
    </div>

    <!-- Back to Login -->
    <div class="text-center">
      <Typography
        variant="body-sm"
        class="ui-text"
      >
        Remember your password?
        <Link
          href="/auth/login"
          class="ui-primary hover:text-(--ui-primary) font-medium ml-1"
        >
          Back to Sign In
        </Link>
      </Typography>
    </div>
  </div>
</template>
