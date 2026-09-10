<script setup>
import { computed, getCurrentInstance, onBeforeUnmount, onMounted } from 'vue'
import Typography from '../components/Typography.vue'
import Divider from '../components/Divider.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Login to your account:'
  },
  subtitle: {
    type: String,
    default: null
  },
  logoUrl: {
    type: String,
    default: null
  },
  secondaryLogoUrl: {
    type: String,
    default: null
  },
  secondaryLogoAlt: {
    type: String,
    default: 'Secondary logo'
  },
  quote: {
    type: String,
    default: 'MANAGEMENT IS DOING THINGS RIGHT, BUT LEADERSHIP IS DOING RIGHT THINGS'
  },
  backgroundImage: {
    type: String,
    default: null
  },
  backgroundOpacity: {
    type: Number,
    default: 1
  },
  appName: {
    type: String,
    default: 'Application'
  },
  appVersion: {
    type: String,
    default: '0.0.1'
  },
  copyright: {
    type: String,
    default: null
  },
  showFooter: {
    type: Boolean,
    default: true
  }
})

const currentYear = computed(() => new Date().getFullYear())
const routerViewComponent = getCurrentInstance()?.appContext.components.RouterView || null
const backgroundStyle = computed(() => {
  const opacity = Number.isFinite(props.backgroundOpacity)
    ? Math.min(1, Math.max(0, props.backgroundOpacity))
    : 1

  return {
    backgroundImage: props.backgroundImage
      ? `url(${JSON.stringify(props.backgroundImage)})`
      : undefined,
    opacity
  }
})
const displayVersion = computed(() => {
  const version = String(props.appVersion ?? '').trim()
  if (!version) return 'v0.0.0'
  return version.toLowerCase().startsWith('v') ? version : `v${version}`
})

onMounted(() => {
  document.documentElement.classList.add('auth-page')
  document.body.classList.add('auth-page')
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove('auth-page')
  document.body.classList.remove('auth-page')
})
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-(--ui-auth-background)">
    <div
      class="absolute inset-0 bg-cover bg-center"
      :style="backgroundStyle"
    />
    <div class="absolute inset-0 bg-(--ui-auth-background)/20" />

    <div class="relative z-10 mx-auto flex min-h-screen w-full max-w-[1400px] items-center px-4 py-4 sm:px-8 sm:py-6 lg:px-14">
      <section class="hidden w-full max-w-4xl pr-10 lg:block">
        <Typography
          v-if="quote"
          variant="body-xl"
          class="max-w-3xl text-2xl leading-[1.4] font-light tracking-wide ui-text-inverse opacity-90 xl:text-[38px]"
        >
          "{{ quote }}"
        </Typography>
      </section>

      <section class="ml-auto w-full max-w-[460px]">
        <div class="overflow-hidden rounded-sm ui-surface">
          <div class="px-1 sm:pt-2">
            <div class="flex items-start justify-between gap-2">
              <img
                v-if="logoUrl"
                :src="logoUrl"
                :alt="`${appName} logo`"
                class="h-16 w-auto max-w-[220px] object-contain sm:h-36"
              >
              <img
                v-if="secondaryLogoUrl"
                :src="secondaryLogoUrl"
                :alt="secondaryLogoAlt"
                class="h-8 w-auto object-contain sm:h-32"
              >
            </div>

            <div
              v-if="$slots['card-header'] || title"
            >
              <slot name="card-header">
                <Typography
                  variant="text-xl"
                  align="center"
                  class="font-normal leading-tight ui-text text-center"
                >
                  {{ title }}
                </Typography>
                <Typography
                  v-if="subtitle"
                  variant="body-sm"
                  class="mt-1 text-xs leading-normal ui-text-muted"
                >
                  {{ subtitle }}
                </Typography>
              </slot>
            </div>
          </div>

          <Divider
            size="sm"
            class="my-0 bg-(--ui-border-strong)"
          />

          <div class="px-5 py-4 sm:px-6 sm:py-2">
            <div class="space-y-4">
              <slot>
                <component :is="routerViewComponent" v-if="routerViewComponent" />
              </slot>
            </div>
          </div>

          <div
            v-if="$slots.links || showFooter"
            class="px-5 pb-4 sm:px-6 sm:pb-5"
          >
            <div
              v-if="$slots.links"
              class="text-right"
            >
              <slot name="links" />
            </div>
            <Typography
              v-if="showFooter"
              variant="body-md"
              class="mt-2 text-right text-xs font-light leading-none ui-text-muted sm:text-[14px]"
            >
              {{ displayVersion }}
            </Typography>
          </div>

          <div
            v-if="$slots['card-footer']"
            class="px-6 pb-6 sm:px-8 sm:pb-8"
          >
            <slot name="card-footer" />
          </div>
        </div>

        <Typography
          v-if="showFooter && copyright"
          variant="body-md"
          class="mt-3 text-center text-sm font-light leading-none ui-text-inverse sm:text-[16px]"
        >
          &copy; {{ copyright }} {{ currentYear }}
        </Typography>
      </section>
    </div>
  </div>
</template>
