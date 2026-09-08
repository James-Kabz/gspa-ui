<template>
  <td :class="cellClasses">
    <slot>
      {{ formattedValue }}
    </slot>
  </td>
</template>

<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  column: {
    type: Object,
    required: true
  },
  value: {
    type: [String, Number, Boolean, Object, Array],
    default: null
  },
  align: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'center', 'right'].includes(value)
  },
  width: {
    type: String,
    default: null
  },
  padding: {
    type: String,
    default: 'normal',
    validator: (value) => ['compact', 'normal', 'comfortable'].includes(value)
  },
  textSize: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'base', 'lg'].includes(value)
  },
  textColor: {
    type: String,
    default: null
  }
})

const formattedValue = computed(() => {
  const value = props.value ?? getCellValue()
  
  if (props.column.formatter) {
    return props.column.formatter(value, props.item)
  }
  
  return value
})

const getCellValue = () => {
  if (props.column.accessor) {
    return props.column.accessor(props.item)
  }
  
  return props.column.key.split('.').reduce((obj, key) => obj?.[key], props.item)
}

const cellVariants = cva('whitespace-nowrap ui-text', {
  variants: {
    align: {
      left: 'text-left',
      center: 'text-center', 
      right: 'text-right'
    },
    padding: {
      compact: 'px-4 py-2',
      normal: 'px-6 py-4',
      comfortable: 'px-8 py-6'
    },
    textSize: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg'
    }
  },
  defaultVariants: {
    align: 'left',
    padding: 'normal',
    textSize: 'md'
  }
})

const cellClasses = computed(() => {
  const align = props.align || props.column.align || 'left'
  const textColorClass = props.textColor ? `text-${props.textColor}` : 'ui-text'
  const widthClass = props.width ? `w-${props.width}` : ''
  
  return cn(
    cellVariants({
      align,
      padding: props.padding,
      textSize: props.textSize
    }),
    textColorClass,
    widthClass,
    props.column.cellClasses
  )
})
</script>
