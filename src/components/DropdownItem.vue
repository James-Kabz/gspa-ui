<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :class="itemClasses"
    :disabled="disabled"
    role="menuitem"
    @click="handleClick"
  >
    <Icon
      v-if="icon"
      :name="icon"
      class="mr-2 h-4 w-4"
    />
    <slot />
    <span
      v-if="shortcut"
      class="ml-auto text-xs tracking-widest opacity-60"
    >
      {{ shortcut }}
    </span>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'
import Icon from './Icon.vue'

const props = defineProps({
  href: String,
  icon: String,
  shortcut: String,
  disabled: Boolean,
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'danger'].includes(value)
  }
})

const emit = defineEmits(['click'])

const itemVariants = cva(
  'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-(--ui-surface) focus:text-(--ui-text) data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  {
    variants: {
      variant: {
        default: 'hover:bg-(--ui-surface) hover:text-(--ui-text)',
        danger: 'ui-danger hover:bg-(--ui-danger-soft) hover:text-(--ui-danger)'
      }
    }
  }
)

const itemClasses = computed(() => 
  cn(itemVariants({ variant: props.variant }))
)

const handleClick = (event) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>
