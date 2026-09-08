<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Size variants
  variant: {
    type: String,
    default: 'body-md',
    validator: (value) =>
      [
        'body-2xs', 'body-xs', 'body-sm', 'body-md', 'body-lg', 'body-xl', 'body-2xl',
        'text-2xs', 'text-xs', 'text-sm', 'text-md', 'text-lg', 'text-xl', 'text-2xl',
        'display-xs', 'display-sm', 'display-md', 'display-lg', 'display-xl', 'display-2xl',
        'caption', 'overline', 'label'
      ].includes(value)
  },

  // Color options
  color: {
    type: String,
    default: 'default',
    validator: (value) => [
      'default', 'primary', 'secondary', 'accent',
      'success', 'warning', 'danger', 'info',
      'muted', 'disabled', 'white', 'black'
    ].includes(value)
  },

  // Alignment
  align: {
    type: String,
    default: 'left',
    validator: (value) =>
      ['left', 'center', 'right', 'justify'].includes(value)
  },

  // Font weight
  weight: {
    type: String,
    default: null,
    validator: (value) =>
      ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'].includes(value)
  },

  // Text transform
  transform: {
    type: String,
    default: null,
    validator: (value) =>
      ['uppercase', 'lowercase', 'capitalize', 'normal'].includes(value)
  },

  // Line height
  leading: {
    type: String,
    default: null,
    validator: (value) =>
      ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'].includes(value)
  },

  // Letter spacing
  tracking: {
    type: String,
    default: null,
    validator: (value) =>
      ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'].includes(value)
  },

  // Boolean modifiers
  italic: Boolean,
  underline: Boolean,
  lineThrough: Boolean,
  truncate: Boolean,
  noWrap: Boolean,
  required: Boolean,
  gradient: Boolean,
  
  // Advanced styling
  maxLines: {
    type: Number,
    default: null
  },
  
  shadow: {
    type: String,
    default: null,
    validator: (value) =>
      ['sm', 'md', 'lg', 'xl', '2xl'].includes(value)
  },

  // Spacing
  spacing: {
    type: String,
    default: null,
    validator: (value) =>
      ['tight', 'normal', 'relaxed', 'loose'].includes(value)
  },

  // Responsive behavior
  responsive: Boolean,

  // Custom opacity
  opacity: {
    type: Number,
    default: null,
    validator: (value) => value >= 0 && value <= 100
  }
})

const tag = computed(() => {
  const tagMap = {
    'body-2xs': 'p',
    'body-xs': 'p',
    'body-sm': 'p',
    'body-md': 'p',
    'body-lg': 'p',
    'body-xl': 'p',
    'body-2xl': 'p',
    'text-2xs': 'h6',
    'text-xs': 'h6',
    'text-sm': 'h5',
    'text-md': 'h4',
    'text-lg': 'h3',
    'text-xl': 'h2',
    'text-2xl': 'h1',
    'display-xs': 'h2',
    'display-sm': 'h2',
    'display-md': 'h1',
    'display-lg': 'h1',
    'display-xl': 'h1',
    'display-2xl': 'h1',
    caption: 'span',
    overline: 'span',
    label: 'label'
  }
  return tagMap[props.variant] || 'p'
})

const variantClasses = computed(() => {
  const variants = {
    'body-2xs': 'text-[10px] leading-normal',
    'body-xs': 'text-xs leading-normal',
    'body-sm': 'text-sm leading-relaxed',
    'body-md': 'text-base leading-relaxed',
    'body-lg': 'text-lg leading-relaxed',
    'body-xl': 'text-xl leading-relaxed',
    'body-2xl': 'text-2xl leading-relaxed',
    'text-2xs': 'text-xs font-semibold leading-snug',
    'text-xs': 'text-sm font-semibold leading-snug',
    'text-sm': 'text-lg font-semibold leading-snug',
    'text-md': 'text-xl font-semibold leading-snug',
    'text-lg': 'text-2xl font-bold leading-snug',
    'text-xl': 'text-3xl font-bold leading-snug',
    'text-2xl': 'text-4xl font-bold leading-snug',
    'display-xs': 'text-3xl font-bold leading-tight tracking-tight',
    'display-sm': 'text-4xl font-bold leading-tight tracking-tight',
    'display-md': 'text-5xl font-bold leading-tight tracking-tight',
    'display-lg': 'text-6xl font-bold leading-tight tracking-tight',
    'display-xl': 'text-7xl font-bold leading-tight tracking-tighter',
    'display-2xl': 'text-8xl font-bold leading-tight tracking-tighter',
    caption: 'text-xs leading-normal ui-text',
    overline: 'text-xs font-medium uppercase tracking-wider leading-normal',
    label: 'text-sm font-medium leading-normal'
  }
  return variants[props.variant]
})

const colorClasses = computed(() => {
  if (props.gradient) {
    return 'bg-linear-to-r from-(--ui-primary) to-(--ui-accent) bg-clip-text text-transparent'
  }
  
  const colors = {
    default: 'ui-text',
    primary: 'ui-primary',
    secondary: 'ui-text',
    accent: 'ui-accent',
    success: 'ui-success',
    warning: 'ui-warning',
    danger: 'ui-danger',
    info: 'ui-primary',
    muted: 'ui-text',
    disabled: 'ui-text',
    white: 'ui-text',
    black: 'ui-text'
  }
  return colors[props.color]
})

const alignClasses = computed(() => ({
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify'
}[props.align]))

const weightClasses = computed(() => {
  if (!props.weight) return ''
  const weights = {
    thin: 'font-thin',
    extralight: 'font-extralight',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black'
  }
  return weights[props.weight]
})

const transformClasses = computed(() => {
  if (!props.transform) return ''
  const transforms = {
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize',
    normal: 'normal-case'
  }
  return transforms[props.transform]
})

const leadingClasses = computed(() => {
  if (!props.leading) return ''
  const leadings = {
    none: 'leading-none',
    tight: 'leading-tight',
    snug: 'leading-snug',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose'
  }
  return leadings[props.leading]
})

const trackingClasses = computed(() => {
  if (!props.tracking) return ''
  const trackings = {
    tighter: 'tracking-tighter',
    tight: 'tracking-tight',
    normal: 'tracking-normal',
    wide: 'tracking-wide',
    wider: 'tracking-wider',
    widest: 'tracking-widest'
  }
  return trackings[props.tracking]
})

const shadowClasses = computed(() => {
  if (!props.shadow) return ''
  const shadows = {
    sm: 'drop-shadow-sm',
    md: 'drop-shadow-md',
    lg: 'drop-shadow-lg',
    xl: 'drop-shadow-xl',
    '2xl': 'drop-shadow-2xl'
  }
  return shadows[props.shadow]
})

const spacingClasses = computed(() => {
  if (!props.spacing) return ''
  const spacings = {
    tight: 'mb-1',
    normal: 'mb-2',
    relaxed: 'mb-4',
    loose: 'mb-6'
  }
  return spacings[props.spacing]
})

const responsiveClasses = computed(() => {
  if (!props.responsive) return ''
  return 'text-sm sm:text-base md:text-lg lg:text-xl'
})

const multiLineClamp = computed(() => {
  if (!props.maxLines) return ''
  return `line-clamp-${props.maxLines}`
})

const customStyles = computed(() => {
  const styles = {}
  if (props.opacity !== null) {
    styles.opacity = props.opacity / 100
  }
  return styles
})

const typographyClasses = computed(() => [
  variantClasses.value,
  colorClasses.value,
  alignClasses.value,
  weightClasses.value,
  transformClasses.value,
  leadingClasses.value,
  trackingClasses.value,
  shadowClasses.value,
  spacingClasses.value,
  responsiveClasses.value,
  multiLineClamp.value,
  {
    italic: props.italic,
    underline: props.underline,
    'line-through': props.lineThrough,
    truncate: props.truncate && !props.maxLines,
    'whitespace-nowrap': props.noWrap,
    'transition-colors duration-200': true,
    'select-none': props.variant === 'overline' || props.variant === 'label'
  }
])
</script>

<template>
  <component
    :is="tag"
    :class="typographyClasses"
    :style="customStyles"
    v-bind="$attrs"
  >
    <slot />
    <span
      v-if="required"
      class="ui-danger ml-1"
      aria-hidden="true"
    >*</span>
  </component>
</template>
