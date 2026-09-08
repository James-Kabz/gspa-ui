<script setup>
import { ref, computed } from 'vue'
import Modal from './Modal.vue'
import MultiSelect from './MultiSelect.vue'

const emit = defineEmits(['update:modelValue', 'save'])

const props = defineProps({
    modelValue: Boolean,
    availableRecipients: {
        type: Array,
        default: () => []
    },
    sendTypeOptions: {
        type: Array,
        default: () => []
    },
    modelName: {
        type: String,
        default: ''
    }
})

/**
 * v-model proxy (prevents prop mutation)
 */
const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const days = ref(0)
const sendType = ref('Email')
const recipients = ref([])

/**
 * Normalize recipients for MultiSelect
 * Expected: [{ value, label }]
 */
const recipientOptions = computed(() =>
    props.availableRecipients.map(r => ({
        value: r,
        label: r
    }))
)

const reset = () => {
    days.value = 0
    sendType.value = 'Email'
    recipients.value = []
}

const save = () => {
    emit('save', {
        days: Number(days.value) || 0,
        sendType: sendType.value,
        recipients: [...recipients.value]
    })
    isOpen.value = false
    reset()
}

const cancel = () => {
    isOpen.value = false
    reset()
}
</script>

<template>
  <Modal
    v-model="isOpen"
    size="xl"
  >
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div>
        <h3 class="text-xl font-semibold ui-text">
          Add Reminder
        </h3>
        <p class="text-sm ui-text">
          Configure reminder rules for <span class="font-medium">{{ modelName }}</span>
        </p>
      </div>

      <!-- Days Before -->
      <div class="space-y-1.5">
        <label class="text-sm font-medium ui-text">
          Days Before Due Date
        </label>
        <input
          v-model="days"
          type="number"
          min="0"
          class="w-full px-3 py-2.5 border rounded-md focus:ring-2 focus:ring-(--ui-primary) focus:outline-none ui-surface  "
        >
      </div>

      <!-- Send Type -->
      <div class="space-y-2">
        <label class="text-sm font-medium ui-text">
          Notification Channel
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in sendTypeOptions"
            :key="option.value"
            type="button"
            class="px-4 py-2 rounded-md text-sm font-medium transition"
            :class="sendType === option.value
              ? 'ui-primary-bg ui-text shadow'
              : '  border ui-surface ui-text hover:brightness-105'"
            @click="sendType = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Recipients -->
      <div class="space-y-2">
        <label class="text-sm font-medium ui-text">
          Recipients
        </label>

        <MultiSelect
          v-model="recipients"
          :options="recipientOptions"
          placeholder="Select recipients..."
        />
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-4 border-t ">
        <button
          type="button"
          class="px-4 py-2 rounded-md   border ui-surface ui-text hover:brightness-105"
          @click="cancel"
        >
          Cancel
        </button>

        <button
          type="button"
          class="px-5 py-2 rounded-md  ui-primary-bg ui-text hover:bg-(--ui-primary-strong) shadow"
          @click="save"
        >
          Add Reminder
        </button>
      </div>
    </div>
  </Modal>
</template>
