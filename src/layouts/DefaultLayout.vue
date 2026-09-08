<template>
  <div class="min-h-screen ui-surface-muted">
    <!-- Header -->
    <Header>
      <template #logo>
        <slot name="logo">
          <Logo />
        </slot>
      </template>
      <template #navigation>
        <slot name="navigation">
          <MainNavigation :items="navigationItems" />
        </slot>
      </template>
      <template #actions>
        <slot name="header-actions">
          <Button
            variant="ghost"
            size="sm"
          >
            Sign In
          </Button>
          <Button size="sm">
            Get Started
          </Button>
        </slot>
      </template>
    </Header>

    <!-- Main Content -->
    <main class="flex-1">
      <!-- Breadcrumb -->
      <div
        v-if="showBreadcrumb"
        class="ui-surface border-b ui-border-strong"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <slot name="breadcrumb">
            <Breadcrumb :items="breadcrumbItems" />
          </slot>
        </div>
      </div>

      <!-- Page Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <Footer>
      <template #brand>
        <slot name="footer-brand">
          <Logo class="mb-4" />
          <Text class="ui-text max-w-md">
            Your application description goes here.
          </Text>
        </slot>
      </template>
    </Footer>
  </div>
</template>

<script setup>
defineProps({
  navigationItems: {
    type: Array,
    default: () => [
      { label: 'Home', href: '/', active: true },
      { label: 'About', href: '/about' },
      { label: 'Services', href: '/services' },
      { label: 'Contact', href: '/contact' }
    ]
  },
  breadcrumbItems: {
    type: Array,
    default: () => []
  },
  showBreadcrumb: {
    type: Boolean,
    default: false
  }
})
</script>
