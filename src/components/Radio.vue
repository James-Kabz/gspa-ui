<template>
  <div class="flex items-center space-x-2">
    <button
      type="button"
      role="radio"
      :aria-checked="isSelected"
      :disabled="disabled"
      :class="radioClasses"
      @click="select"
    >
      <div
        v-if="isSelected"
        :class="indicatorClasses"
      />
    </button>
    <label 
      v-if="label" 
      :class="labelClasses"
      @click="select"
    >
      {{ label }}
    </label>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

const props = defineProps({
  modelValue: null,
  value: {
    type: [String, Number, Boolean],
    required: true
  },
  label: String,
  disabled: Boolean,
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  class: String
})

const emit = defineEmits(['update:modelValue'])

const isSelected = computed(() => props.modelValue === props.value)

const radioVariants = cva(
  'aspect-square rounded-full border border-(--ui-primary) ui-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-primary) focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6'
      }
    }
  }
)

const radioClasses = computed(() => 
  cn(
    radioVariants({ size: props.size }),
    props.disabled && 'cursor-not-allowed opacity-50',
    props.class
  )
)

const indicatorClasses = computed(() => 
  cn(
    'flex items-center justify-center rounded-full bg-primary',
    {
      'h-2 w-2': props.size === 'sm',
      'h-2.5 w-2.5': props.size === 'md',
      'h-3 w-3': props.size === 'lg'
    }
  )
)

const labelClasses = computed(() => 
  cn(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    !props.disabled && 'cursor-pointer'
  )
)

const select = () => {
  if (!props.disabled) {
    emit('update:modelValue', props.value)
  }
}
</script>
