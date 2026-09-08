<template>
  <div :class="cn(fieldVariants({ size }), $attrs.class)">
    <!-- Label -->
    <label
      v-if="label"
      :for="fieldId"
      :class="cn(labelVariants({ size }))"
    >
      {{ label }}
      <span
        v-if="required"
        class="ui-danger ml-1"
        aria-label="required"
      >*</span>
    </label>

    <!-- Description -->
    <p
      v-if="description"
      :class="cn(descriptionVariants({ size }))"
    >
      {{ description }}
    </p>

    <!-- Input Wrapper -->
    <div class="relative">
      <DatePicker
        v-if="type === 'date'"
        :id="fieldId"
        :model-value="modelValue"
        :disabled="false"
        :required="required"
        :class="hasError ? 'border-(--ui-danger)' : ''"
        @update:model-value="emit('update:modelValue', $event)"
      />
      <slot
        v-else
        :field-id="fieldId"
        :has-error="hasError"
        :aria-described-by="ariaDescribedBy"
        :show-password="showPassword"
        :toggle-password-visibility="togglePasswordVisibility"
      />

      <!-- Password Toggle Button (only for password fields) -->
      <button
        v-if="type === 'password'"
        type="button"
        class="absolute inset-y-0 right-0 pr-3 flex items-center ui-text hover:text-(--ui-text) transition-colors"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        @click="togglePasswordVisibility"
      >
        <font-awesome-icon
          :icon="showPassword ? 'eye-slash' : 'eye'"
          class="w-4 h-4"
        />
      </button>
    </div>

    <!-- Error Message -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="hasError"
        :id="`${fieldId}-error`"
        :class="cn(messageVariants({ size, intent: 'error' }))"
        role="alert"
        aria-live="polite"
      >
        <font-awesome-icon
          icon="exclamation-triangle"
          class="w-4 h-4 shrink-0 mt-0.5"
        />
        <span>{{ error }}</span>
      </div>
    </Transition>

    <!-- Help Text -->
    <p
      v-if="helpText && !hasError"
      :id="`${fieldId}-help`"
      :class="cn(helpVariants({ size }))"
    >
      {{ helpText }}
    </p>

    <!-- Success Message -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="success && !hasError"
        :class="cn(messageVariants({ size, intent: 'success' }))"
      >
        <font-awesome-icon
          icon="check"
          class="w-4 h-4 shrink-0 mt-0.5"
        />
        <span>{{ success }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { cva } from "class-variance-authority"
import { cn } from "../utils/cn.js"
import DatePicker from "./DatePicker.vue"

const props = defineProps({
  label: String,
  description: String,
  error: String,
  success: String,
  helpText: String,
  required: { type: Boolean, default: false },
  type: { type: String, default: "text" }, // Added type prop
  modelValue: [String, Date],
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg"].includes(v),
  },
  id: String,
})

const emit = defineEmits(['update:modelValue'])

const generatedId = `field-${Math.random().toString(36).slice(2, 9)}`
const fieldId = computed(() => `${props.id || generatedId}-${Math.random().toString(36).slice(2, 5)}`)
const hasError = computed(() => !!props.error)
const showPassword = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const ariaDescribedBy = computed(() => {
  const ids = []
  if (props.error) ids.push(`${fieldId.value}-error`)
  else if (props.helpText) ids.push(`${fieldId.value}-help`)
  return ids.length > 0 ? ids.join(" ") : undefined
})

/* ------------------ CVA Variants ------------------ */

const fieldVariants = cva("ui-text", {
  variants: {
    size: {
      sm: "space-y-1",
      md: "space-y-2",
      lg: "space-y-3",
    },
  },
  defaultVariants: { size: "md" },
})

const labelVariants = cva("block ui-text", {
  variants: {
    size: {
      sm: "text-xs font-medium",
      md: "text-sm font-medium",
      lg: "text-base font-medium",
    },
  },
  defaultVariants: { size: "md" },
})

const descriptionVariants = cva("ui-text", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: { size: "md" },
})

const messageVariants = cva("flex items-start gap-2", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-sm",
    },
    intent: {
      error: "ui-danger",
      success: "ui-success",
    },
  },
  defaultVariants: { size: "md", intent: "error" },
})

const helpVariants = cva("ui-text", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-sm",
    },
  },
  defaultVariants: { size: "md" },
})
</script>
