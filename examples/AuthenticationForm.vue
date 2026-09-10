<script setup>
import { ref } from 'vue'
import { AuthLayout, Button, FormField, Input } from '@gspa/ui'
import '@gspa/ui/css'

const email = ref('')
const password = ref('')
const serverError = ref('')
const submit = () => {
  serverError.value = password.value.length < 8 ? 'Password must contain at least 8 characters.' : ''
}
</script>

<template>
  <AuthLayout
    title="Sign in to the Security Academy"
    subtitle="Continue your professional learning"
    app-name="GSPA Security Academy"
    logo-url="/brand/academy-logo.svg"
    secondary-logo-url="/brand/accreditation-logo.svg"
    background-image="/brand/auth-background.jpg"
    :background-opacity="0.35"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <FormField label="Email address" name="email" type="email" autocomplete="email" required help-text="Use your registered address.">
        <Input v-model="email" />
      </FormField>
      <FormField label="Password" name="password" type="password" autocomplete="current-password" required :server-error="serverError">
        <Input v-model="password" />
      </FormField>
      <Button type="submit" class="w-full">Sign in</Button>
    </form>
  </AuthLayout>
</template>
