<template>
  <nav
    :aria-label="ariaLabel"
    class="flex"
    :class="breadcrumbClasses"
  >
    <ol class="flex items-center space-x-1">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="flex items-center"
      >
        <component
          :is="item.href ? 'a' : 'span'"
          :href="item.href"
          :class="[
            'text-sm font-medium transition-colors hover:text-(--ui-text)',
            index === items.length - 1 
              ? 'ui-text' 
              : 'ui-text hover:text-(--ui-text)'
          ]"
          :aria-current="index === items.length - 1 ? 'page' : undefined"
        >
          {{ item.label }}
        </component>
        <Icon 
          v-if="index < items.length - 1"
          :name="separator" 
          class="mx-2 h-4 w-4 text-muted-foreground"
        />
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'
import Icon from './Icon.vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    validator: (items) => items.every(item => item.label)
  },
  separator: {
    type: String,
    default: 'chevron-right'
  },
  ariaLabel: {
    type: String,
    default: 'Breadcrumb navigation'
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'ghost'].includes(value)
  }
})

const breadcrumbVariants = cva('', {
  variants: {
    variant: {
      default: '',
      ghost: 'text-muted-foreground'
    }
  }
})

const breadcrumbClasses = computed(() => 
  cn(breadcrumbVariants({ variant: props.variant }))
)
</script>
