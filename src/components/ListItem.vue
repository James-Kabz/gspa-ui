<template>
  <li
    :class="itemClasses"
    :role="role"
  >
    <component
      :is="href ? 'a' : 'div'"
      :href="href"
      :class="contentClasses"
      @click="handleClick"
    >
      <div
        v-if="$slots.icon || icon"
        class="shrink-0"
      >
        <slot name="icon">
          <Icon
            v-if="icon"
            :name="icon"
            class="h-5 w-5"
          />
        </slot>
      </div>
      
      <div class="flex-1 min-w-0">
        <div
          v-if="title"
          class="text-sm font-medium ui-text"
        >
          {{ title }}
        </div>
        <div
          v-if="description"
          class="text-sm text-muted-foreground"
        >
          {{ description }}
        </div>
        <slot />
      </div>
      
      <div
        v-if="$slots.action"
        class="shrink-0"
      >
        <slot name="action" />
      </div>
    </component>
  </li>
</template>

<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'
import Icon from './Icon.vue'

const props = defineProps({
  title: String,
  description: String,
  icon: String,
  href: String,
  role: String,
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'interactive'].includes(value)
  }
})

const emit = defineEmits(['click'])

const itemVariants = cva('', {
  variants: {
    variant: {
      default: '',
      interactive: 'hover:bg-(--ui-surface) cursor-pointer'
    }
  }
})

const contentVariants = cva('flex items-center space-x-3 p-3', {
  variants: {
    variant: {
      default: '',
      interactive: 'transition-colors rounded-md'
    }
  }
})

const itemClasses = computed(() => 
  cn(itemVariants({ variant: props.variant }))
)

const contentClasses = computed(() => 
  cn(contentVariants({ variant: props.variant }))
)

const handleClick = (event) => {
  emit('click', event)
}
</script>
