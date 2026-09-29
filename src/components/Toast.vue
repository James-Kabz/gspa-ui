<script setup>
import { computed, h } from 'vue'
import { useToaster } from '../lib/toast.js'
import Icon from './Icon.vue'

const props = defineProps({
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => [
      'top-left', 'top-center', 'top-right',
      'bottom-left', 'bottom-center', 'bottom-right'
    ].includes(value)
  },
  hotkey: {
    type: Array,
    default: () => ['altKey', 'KeyT']
  },
  richColors: {
    type: Boolean,
    default: true
  },
  expand: {
    type: Boolean,
    default: false
  },
  visibleToasts: {
    type: Number,
    default: 3
  },
  closeButton: {
    type: Boolean,
    default: true
  }
})

const { toasts, dismiss } = useToaster()
const visibleToastsList = computed(() => toasts.value.slice(0, props.visibleToasts))

const createSvgIcon = (name, children) => ({
  name: `Toast${name}Icon`,
  render() {
    return h('svg', {
      'data-toast-icon': name.toLowerCase(),
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 1.9,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'aria-hidden': 'true'
    }, children.map(([tag, attributes]) => h(tag, attributes)))
  }
})

const DefaultIcon = createSvgIcon('default', [
  ['path', { d: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9' }],
  ['path', { d: 'M10 21h4' }]
])
const InfoIcon = createSvgIcon('info', [
  ['circle', { cx: '12', cy: '12', r: '9' }],
  ['path', { d: 'M12 11v5' }],
  ['path', { d: 'M12 8h.01' }]
])
const SuccessIcon = createSvgIcon('success', [
  ['circle', { cx: '12', cy: '12', r: '9' }],
  ['path', { d: 'm8.5 12 2.3 2.3 4.9-5' }]
])
const WarningIcon = createSvgIcon('warning', [
  ['path', { d: 'M10.3 4.1 2.7 17.2A1.8 1.8 0 0 0 4.3 20h15.4a1.8 1.8 0 0 0 1.6-2.8L13.7 4.1a2 2 0 0 0-3.4 0Z' }],
  ['path', { d: 'M12 9v4' }],
  ['path', { d: 'M12 16.5h.01' }]
])
const ErrorIcon = createSvgIcon('error', [
  ['circle', { cx: '12', cy: '12', r: '9' }],
  ['path', { d: 'm9 9 6 6' }],
  ['path', { d: 'm15 9-6 6' }]
])
const LoadingIcon = createSvgIcon('loading', [
  ['path', { d: 'M21 12a9 9 0 1 1-2.64-6.36' }]
])
const CloseIcon = createSvgIcon('close', [
  ['path', { d: 'm7.5 7.5 9 9' }],
  ['path', { d: 'm16.5 7.5-9 9' }]
])
const ArrowIcon = createSvgIcon('arrow', [
  ['path', { d: 'M5 12h14' }],
  ['path', { d: 'm14 7 5 5-5 5' }]
])

const builtInIcons = {
  default: DefaultIcon,
  info: InfoIcon,
  success: SuccessIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  loading: LoadingIcon
}

const variant = (toastItem) => builtInIcons[toastItem.variant] ? toastItem.variant : 'default'
const builtInIcon = (toastItem) => builtInIcons[variant(toastItem)]
const hasNamedIcon = (toastItem) => typeof toastItem.icon === 'string'
const customIcon = (toastItem) => {
  if (toastItem.icon && typeof toastItem.icon !== 'string' && toastItem.icon !== true) {
    return toastItem.icon
  }
  return builtInIcon(toastItem)
}
const showIcon = (toastItem) => toastItem.icon !== false
const isDismissible = (toastItem) => toastItem.dismissible !== false && (
  toastItem.closeButton || props.closeButton || toastItem.dismissible
)
const positionClass = computed(() => `kv-toast-region--${props.position}`)
const stackClass = computed(() => props.position.startsWith('bottom-') ? 'kv-toast-stack--bottom' : '')
</script>

<template>
  <Teleport to="body">
    <section
      class="kv-toast-region"
      :class="positionClass"
      aria-label="Notifications"
      :data-expanded="props.expand"
      :data-hotkey="props.hotkey.join('+')"
    >
      <TransitionGroup
        name="kv-toast"
        tag="div"
        class="kv-toast-stack"
        :class="stackClass"
      >
        <article
          v-for="toastItem in visibleToastsList"
          :key="toastItem.id"
          class="kv-toast"
          :class="[
            `kv-toast--${variant(toastItem)}`,
            { 'kv-toast--subtle': !props.richColors }
          ]"
          role="alert"
          :aria-live="toastItem.variant === 'error' ? 'assertive' : 'polite'"
          aria-atomic="true"
        >
          <span
            v-if="showIcon(toastItem)"
            class="kv-toast__icon"
          >
            <Icon
              v-if="hasNamedIcon(toastItem)"
              :icon="toastItem.icon"
              aria-hidden="true"
            />
            <component
              :is="customIcon(toastItem)"
              v-else
            />
          </span>

          <div class="kv-toast__content">
            <div
              v-if="toastItem.title || toastItem.statusCode"
              class="kv-toast__heading"
            >
              <p
                v-if="toastItem.title"
                class="kv-toast__title"
              >
                {{ toastItem.title }}
              </p>
              <span
                v-if="toastItem.statusCode"
                class="kv-toast__status"
                :aria-label="`HTTP status ${toastItem.statusCode}`"
              >
                {{ toastItem.statusCode }}
              </span>
            </div>
            <p
              v-if="toastItem.message || toastItem.description"
              class="kv-toast__message"
            >
              {{ toastItem.message || toastItem.description }}
            </p>

            <component
              :is="toastItem.component"
              v-if="toastItem.component"
              v-bind="toastItem.componentProps"
              class="kv-toast__custom-content"
            />

            <button
              v-if="toastItem.action"
              type="button"
              class="kv-toast__action"
              @click="toastItem.action.onClick"
            >
              {{ toastItem.action.label }}
              <ArrowIcon />
            </button>
          </div>

          <button
            v-if="isDismissible(toastItem)"
            type="button"
            class="kv-toast__close"
            aria-label="Dismiss notification"
            @click="dismiss(toastItem.id)"
          >
            <CloseIcon />
          </button>
        </article>
      </TransitionGroup>
    </section>
  </Teleport>
</template>

<style scoped>
.kv-toast-region {
  position: fixed;
  z-index: 10000;
  width: min(408px, 100vw);
  max-height: 100dvh;
  padding: 16px;
  box-sizing: border-box;
  pointer-events: none;
}

.kv-toast-region--top-left { top: 0; left: 0; }
.kv-toast-region--top-center { top: 0; left: 50%; transform: translateX(-50%); }
.kv-toast-region--top-right { top: 0; right: 0; }
.kv-toast-region--bottom-left { bottom: 0; left: 0; }
.kv-toast-region--bottom-center { bottom: 0; left: 50%; transform: translateX(-50%); }
.kv-toast-region--bottom-right { right: 0; bottom: 0; }

.kv-toast-stack {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
}

.kv-toast-stack--bottom { flex-direction: column-reverse; }

.kv-toast {
  --toast-accent: var(--ui-primary, #173866);
  --toast-soft: var(--ui-primary-soft, #e6edf7);

  position: relative;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) 28px;
  align-items: start;
  gap: 10px;
  width: 100%;
  min-height: 58px;
  padding: 12px 10px 13px 12px;
  overflow: hidden;
  box-sizing: border-box;
  color: var(--ui-text, #172033);
  background: var(--ui-surface, #ffffff);
  border: 1px solid var(--ui-border, #dce3ed);
  border-radius: 14px;
  box-shadow: 0 12px 30px rgb(15 23 42 / 14%), 0 2px 8px rgb(15 23 42 / 7%);
  pointer-events: auto;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.kv-toast::before {
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 0;
  width: 3px;
  background: var(--toast-accent);
  border-radius: 0 3px 3px 0;
  content: '';
}

.kv-toast:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 38px rgb(15 23 42 / 17%), 0 3px 10px rgb(15 23 42 / 8%);
}

.kv-toast--info { --toast-accent: var(--ui-cyber, #176b87); --toast-soft: var(--ui-cyber-soft, #e0f2f7); }
.kv-toast--success { --toast-accent: var(--ui-success, #14745d); --toast-soft: var(--ui-success-soft, #def3eb); }
.kv-toast--warning { --toast-accent: var(--ui-warning, #a96008); --toast-soft: var(--ui-warning-soft, #fff0d6); }
.kv-toast--error { --toast-accent: var(--ui-danger, #b4233c); --toast-soft: var(--ui-danger-soft, #fde7eb); }
.kv-toast--subtle::before { opacity: 0.65; }

.kv-toast__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  color: var(--toast-accent);
  background: var(--toast-soft);
  border-radius: 10px;
}

.kv-toast__icon :deep(svg) { display: block; width: 19px; height: 19px; }
.kv-toast--loading .kv-toast__icon :deep(svg) { animation: kv-toast-spin 900ms linear infinite; }

.kv-toast__content { min-width: 0; padding: 1px 0; }

.kv-toast__heading {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.kv-toast__title,
.kv-toast__message {
  padding: 0;
  margin: 0;
  font-family: inherit;
}

.kv-toast__title {
  min-width: 0;
  overflow-wrap: anywhere;
  color: var(--ui-text, #172033);
  font-size: 0.875rem;
  font-weight: 650;
  line-height: 1.35;
  letter-spacing: -0.006em;
}

.kv-toast__status {
  display: inline-flex;
  flex: none;
  align-items: center;
  min-height: 18px;
  padding: 1px 5px;
  color: var(--toast-accent);
  font-size: 0.625rem;
  font-weight: 750;
  line-height: 1;
  letter-spacing: 0.03em;
  background: var(--toast-soft);
  border-radius: 5px;
}

.kv-toast__message {
  margin-top: 3px;
  overflow-wrap: anywhere;
  color: var(--ui-text-muted, #5b687a);
  font-size: 0.8125rem;
  font-weight: 400;
  line-height: 1.45;
}

.kv-toast__custom-content { margin-top: 9px; }

.kv-toast__action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 26px;
  padding: 3px 7px;
  margin: 9px 0 0 -7px;
  color: var(--toast-accent);
  font: inherit;
  font-size: 0.775rem;
  font-weight: 650;
  line-height: 1;
  background: transparent;
  border: 0;
  border-radius: 7px;
  cursor: pointer;
}

.kv-toast__action:hover { background: var(--toast-soft); }
.kv-toast__action :deep(svg) { width: 13px; height: 13px; transition: transform 150ms ease; }
.kv-toast__action:hover :deep(svg) { transform: translateX(2px); }

.kv-toast__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: var(--ui-text-soft, #78869a);
  background: transparent;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  transition: color 150ms ease, background 150ms ease;
}

.kv-toast__close:hover {
  color: var(--ui-text, #172033);
  background: var(--ui-surface-muted, #f0f3f8);
}

.kv-toast__close:focus-visible,
.kv-toast__action:focus-visible {
  outline: 2px solid var(--ui-ring, var(--ui-primary, #173866));
  outline-offset: 2px;
}

.kv-toast__close :deep(svg) { width: 16px; height: 16px; }

.kv-toast-enter-active,
.kv-toast-leave-active,
.kv-toast-move {
  transition: opacity 220ms ease, transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
}

.kv-toast-enter-from,
.kv-toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

@keyframes kv-toast-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .kv-toast-region { width: 100vw; padding: 10px; }
  .kv-toast { border-radius: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  .kv-toast,
  .kv-toast-enter-active,
  .kv-toast-leave-active,
  .kv-toast-move,
  .kv-toast__action :deep(svg) {
    transition-duration: 0.01ms;
  }

  .kv-toast--loading .kv-toast__icon :deep(svg) { animation-duration: 1.8s; }
}
</style>
