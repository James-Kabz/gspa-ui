<script setup>
import { ref } from 'vue'
import Icon from './Icon.vue'
import Modal from './Modal.vue'

const props = defineProps({
  models: {
    type: Array,
    default: () => []
  },
  availableRecipients: {
    type: Array,
    default: () => []
  },
  sendTypeOptions: {
    type: Array,
    default: () => [
      { value: 'email', label: 'Email' },
      { value: 'in-app', label: 'In-App' }
    ]
  }
})

const emit = defineEmits(['update:models'])

const selectedModel = ref(null)
const showRecipientModal = ref(false)
const currentReminder = ref(null)

const toggleModel = (modelId) => {
  const model = props.models.find((m) => m.id === modelId)
  if (model) {
    model.expanded = !model.expanded
    emit('update:models', [...props.models])
  }
}

const addReminder = (modelId) => {
  const model = props.models.find((m) => m.id === modelId)
  if (model) {
    const newReminder = {
      id: Date.now(),
      days: 0,
      recipients: [],
      sendTypes: [],
      isDaily: false
    }
    model.reminders.push(newReminder)
    emit('update:models', [...props.models])
  }
}

const deleteReminder = (modelId, reminderId) => {
  const model = props.models.find((m) => m.id === modelId)
  if (model) {
    model.reminders = model.reminders.filter((r) => r.id !== reminderId)
    emit('update:models', [...props.models])
  }
}

const updateReminderDays = (modelId, reminderId, days) => {
  const model = props.models.find((m) => m.id === modelId)
  if (model) {
    const reminder = model.reminders.find((r) => r.id === reminderId)
    if (reminder) {
      reminder.days = parseInt(days) || 0
      emit('update:models', [...props.models])
    }
  }
}

const toggleSendType = (modelId, reminderId, sendTypeValue) => {
  const model = props.models.find((m) => m.id === modelId)
  if (model) {
    const reminder = model.reminders.find((r) => r.id === reminderId)
    if (reminder) {
      if (!reminder.sendTypes) {
        reminder.sendTypes = []
      }
      const index = reminder.sendTypes.indexOf(sendTypeValue)
      if (index > -1) {
        reminder.sendTypes.splice(index, 1)
      } else {
        reminder.sendTypes.push(sendTypeValue)
      }
      emit('update:models', [...props.models])
    }
  }
}

const toggleIsDaily = (modelId, reminderId) => {
  const model = props.models.find((m) => m.id === modelId)
  if (model) {
    const reminder = model.reminders.find((r) => r.id === reminderId)
    if (reminder) {
      reminder.isDaily = !reminder.isDaily
      emit('update:models', [...props.models])
    }
  }
}

const openRecipientModal = (modelId, reminderId) => {
  const model = props.models.find((m) => m.id === modelId)
  const reminder = model.reminders.find((r) => r.id === reminderId)
  selectedModel.value = modelId
  currentReminder.value = { ...reminder, recipients: [...(reminder.recipients || [])] }
  showRecipientModal.value = true
}

const toggleRecipient = (recipient) => {
  const index = currentReminder.value.recipients.indexOf(recipient)
  if (index > -1) {
    currentReminder.value.recipients.splice(index, 1)
  } else {
    currentReminder.value.recipients.push(recipient)
  }
}

const saveRecipients = () => {
  const model = props.models.find((m) => m.id === selectedModel.value)
  if (model) {
    const reminder = model.reminders.find((r) => r.id === currentReminder.value.id)
    if (reminder) {
      reminder.recipients = [...currentReminder.value.recipients]
      emit('update:models', [...props.models])
    }
  }
  showRecipientModal.value = false
}
</script>

<template>
  <div class="reminder-config-wrapper">
    <!-- Models Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        v-for="model in models"
        :key="model.id"
        class="ui-surface  rounded-2xl shadow-lg border ui-border-strong  overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        <!-- Model Header -->
        <div
          class="p-6 cursor-pointer hover:bg-linear-to-r hover:from-(--ui-primary-soft) hover:to-(--ui-accent-soft) transition-all duration-300 border-b ui-border-strong "
          @click="toggleModel(model.id)"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 bg-linear-to-br from-(--ui-primary) to-(--ui-accent) rounded-xl flex items-center justify-center shadow-md"
              >
                <span class="ui-text font-bold text-lg">
                  {{ model.name[0] }}
                </span>
              </div>
              <div>
                <h2 class="text-xl font-bold ui-text">
                  {{ model.name }}
                </h2>
                <div class="flex items-center gap-2 mt-1">
                  <span
                    class="inline-flex items-center gap-1.5 px-3 py-1 ui-primary-soft ui-primary text-xs font-semibold rounded-full"
                  >
                    <div class="w-1.5 h-1.5 ui-primary-bg rounded-full" />
                    {{ model.reminders.length }} reminder{{ model.reminders.length !== 1 ? 's' : '' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <button
                class="px-4 py-2.5 bg-linear-to-r from-(--ui-success) to-(--ui-success) ui-text-inverse rounded-lg font-semibold text-sm hover:from-(--ui-success) hover:to-(--ui-success-strong) transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
                @click.stop="addReminder(model.id)"
              >
                <Icon
                  icon="plus"
                  class="w-4 h-4"
                  :class="{ 'ui-text': !model.expanded, 'ui-text-inverse': model.expanded }"
                />
                Add Reminder
              </button>
              <Icon
                :icon="model.expanded ? 'chevron-up' : 'chevron-down'"
                class="w-6 h-6 ui-text transition-transform duration-300"
                :class="{ 'rotate-180': model.expanded }"
              />
            </div>
          </div>
        </div>

        <!-- Model Content -->
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-screen"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 max-h-screen"
          leave-to-class="opacity-0 max-h-0"
        >
          <div
            v-if="model.expanded"
            class="p-6 bg-linear-to-br from-(--ui-surface) to-[color:color-mix(in oklab, var(--ui-primary-soft), transparent 70%)]"
          >
            <!-- Empty State -->
            <div
              v-if="model.reminders.length === 0"
              class="text-center py-16"
            >
              <div
                class="w-20 h-20 bg-linear-to-br from-(--ui-surface) to-(--ui-bg) rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <Icon
                  icon="bell"
                  class="w-10 h-10 ui-text"
                />
              </div>
              <h3 class="text-lg font-semibold ui-text mb-2">
                No reminders configured
              </h3>
              <p class="ui-text text-sm mb-4">
                Click "Add Reminder" to create your first reminder
              </p>
            </div>

            <!-- Reminders List -->
            <div
              v-else
              class="space-y-4"
            >
              <div
                v-for="reminder in model.reminders"
                :key="reminder.id"
                class="ui-surface  rounded-xl border ui-border-strong  p-6 hover:shadow-md transition-all duration-300"
              >
                <div class="flex items-start gap-4">
                  <div class="flex-1 space-y-5">
                    <!-- Days Input -->
                    <div>
                      <label class="block text-xs font-bold ui-text mb-2 uppercase tracking-wider">
                        Days Before Event
                      </label>
                      <div class="relative">
                        <input
                          type="number"
                          min="0"
                          :value="reminder.days"
                          class="w-full px-4 py-3 border-2 ui-border-strong  rounded-lg focus:outline-none focus:border-(--ui-primary) focus:ring-4 focus:ring-(--ui-primary) transition-all duration-300 font-semibold ui-text text-lg"
                          placeholder="0"
                          @input="updateReminderDays(model.id, reminder.id, $event.target.value)"
                        >
                        <div class="absolute right-4 top-1/2 -translate-y-1/2 ui-text text-sm font-medium">
                          days
                        </div>
                      </div>
                    </div>

                    <!-- Daily Reminder Toggle -->
                    <div class="flex items-center gap-3 p-4 ui-surface-muted rounded-lg border ui-border-strong ">
                      <input
                        :id="`daily-${reminder.id}`"
                        type="checkbox"
                        :checked="reminder.isDaily"
                        class="w-4 h-4 ui-primary rounded border ui-border-strong focus:ring-2 focus:ring-(--ui-primary) transition-all cursor-pointer"
                        @change="toggleIsDaily(model.id, reminder.id)"
                      >
                      <label
                        :for="`daily-${reminder.id}`"
                        class="flex-1 cursor-pointer"
                      >
                        <span class="text-sm font-semibold ui-text block">
                          Send Daily Reminder
                        </span>
                        <span class="text-xs ui-text">
                          Repeat this reminder every day
                        </span>
                      </label>
                    </div>

                    <!-- Send Type (Multi-select) -->
                    <div>
                      <label class="block text-xs font-bold ui-text mb-3 uppercase tracking-wider">
                        Notification Methods
                      </label>
                      <div class="grid grid-cols-2 gap-3">
                        <button
                          v-for="option in sendTypeOptions"
                          :key="option.value"
                          :class="[
                            'relative px-4 py-3.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 border-2',
                            (reminder.sendTypes || []).includes(option.value)
                              ? 'bg-linear-to-r from-(--ui-primary) to-(--ui-accent) ui-text-inverse border-transparent shadow-md'
                              : 'ui-surface  ui-text ui-border-strong  hover:border-(--ui-primary-soft) hover:bg-(--ui-primary-soft)'
                          ]"
                          @click="toggleSendType(model.id, reminder.id, option.value)"
                        >
                          <Icon
                            :icon="option.value === 'email' ? 'envelope' : 'bell'"
                            class="w-4 h-4"
                          />
                          {{ option.label }}
                          <Icon
                            v-if="(reminder.sendTypes || []).includes(option.value)"
                            icon="check-circle"
                            class="w-4 h-4 absolute top-2 right-2"
                          />
                        </button>
                      </div>
                    </div>

                    <!-- Recipients -->
                    <div>
                      <label class="block text-xs font-bold ui-text mb-3 uppercase tracking-wider">
                        Recipients
                      </label>
                      <button
                        class="w-full px-4 py-3.5 ui-surface  border-2 ui-border-strong  rounded-lg hover:border-(--ui-primary-soft) hover:bg-(--ui-primary-soft) transition-all duration-300 flex items-center justify-between group"
                        @click="openRecipientModal(model.id, reminder.id)"
                      >
                        <div class="flex items-start gap-3">
                          <div
                            class="w-10 h-10 bg-linear-to-br from-(--ui-primary-soft) to-(--ui-accent-soft) rounded-lg flex items-center justify-center group-hover:from-(--ui-primary-soft) group-hover:to-(--ui-accent-soft) transition-all"
                          >
                            <Icon
                              icon="users"
                              class="w-5 h-5 ui-primary"
                            />
                          </div>
                          <div class="text-left">
                            <span class="text-sm font-semibold ui-text block">
                              {{ (reminder.recipients || []).length === 0 ? 'Select recipients' :
                                `${(reminder.recipients || []).length} recipient${(reminder.recipients || []).length !== 1
                                  ? 's' : ''} selected` }}
                            </span>
                            <span class="text-xs ui-text">
                              Click to manage
                            </span>
                          </div>
                        </div>
                        <Icon
                          icon="chevron-right"
                          class="w-5 h-5 ui-text group-hover:text-(--ui-primary) group-hover:translate-x-1 transition-all"
                        />
                      </button>

                      <!-- Selected Recipients -->
                      <div
                        v-if="(reminder.recipients || []).length > 0"
                        class="mt-3 p-4 ui-surface-muted rounded-lg border ui-border-strong "
                      >
                        <div class="flex flex-wrap gap-2">
                          <span
                            v-for="recipient in reminder.recipients"
                            :key="recipient"
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 ui-surface  border border-(--ui-primary-soft) ui-primary text-xs font-semibold rounded-lg shadow-sm"
                          >
                            <Icon
                              icon="user"
                              class="w-3 h-3"
                            />
                            {{ recipient }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Delete Button -->
                  <button
                    class="p-3 bg-linear-to-r from-(--ui-danger) to-(--ui-danger) ui-text rounded-lg hover:from-(--ui-danger) hover:to-(--ui-danger-strong) transition-all duration-300 shadow-md hover:shadow-lg self-start"
                    title="Delete reminder"
                    @click="deleteReminder(model.id, reminder.id)"
                  >
                    <Icon
                      icon="trash"
                      class="w-4 h-4"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Recipient Modal -->
    <Modal
      v-model="showRecipientModal"
      size="3xl"
      :show-close="false"
    >
      <!-- Modal Header -->
      <div class="bg-linear-to-r from-(--ui-success) to-(--ui-success) p-6 ui-text">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 bg-[color:color-mix(in oklab, var(--ui-bg), transparent 80%)] rounded-lg flex items-center justify-center">
              <Icon
                icon="users"
                class="w-4 h-4"
              />
            </div>
            <div>
              <h3 class="text-lg font-semibold leading-tight">
                Select Recipients
              </h3>
              <p class="text-(--ui-primary-soft) text-xs mt-1">
                Choose who should receive this reminder
              </p>
            </div>
          </div>
          <button
            class="p-1.5 hover:bg-[color:color-mix(in oklab, var(--ui-surface), transparent 80%)] rounded-md transition-colors"
            aria-label="Close"
            @click="showRecipientModal = false"
          >
            <Icon
              icon="x"
              class="w-4 h-4"
            />
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="ui-surface px-5 py-4 max-h-88 overflow-y-auto">
        <div
          v-if="availableRecipients.length === 0"
          class="text-center py-6"
        >
          <Icon
            icon="users"
            class="w-10 h-10 ui-text mx-auto mb-2"
          />
          <p class="ui-text text-sm">
            No recipients available
          </p>
        </div>
        <div
          v-else
          class="space-y-2"
        >
          <label
            v-for="recipient in availableRecipients"
            :key="recipient"
            :class="[
              'flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all border',
              currentReminder?.recipients.includes(recipient)
                ? 'bg-linear-to-r from-(--ui-primary-soft) to-(--ui-accent-soft) border-(--ui-primary-soft) shadow-sm'
                : 'ui-surface ui-border hover:border-(--ui-primary-soft) hover:bg-(--ui-surface-muted)'
            ]"
          >
            <div class="relative shrink-0">
              <input
                type="checkbox"
                :checked="currentReminder?.recipients.includes(recipient)"
                class="w-4 h-4 ui-primary rounded border ui-border-strong focus:ring-2 focus:ring-(--ui-primary) transition-all cursor-pointer"
                @change="toggleRecipient(recipient)"
              >
            </div>
            <div class="flex-1 min-w-0">
              <span
                :class="[
                  'text-sm font-medium block truncate',
                  currentReminder?.recipients.includes(recipient) ? 'ui-primary' : 'ui-text'
                ]"
              >
                {{ recipient }}
              </span>
            </div>
            <Icon
              v-if="currentReminder?.recipients.includes(recipient)"
              icon="check-circle"
              class="w-4 h-4 ui-primary shrink-0"
            />
          </label>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-5 py-4 ui-surface-muted border-t ui-border flex gap-2">
        <button
          class="px-4 py-2 ui-surface border ui-border ui-text rounded-md text-sm font-medium hover:bg-(--ui-surface-muted) transition-colors"
          @click="showRecipientModal = false"
        >
          Cancel
        </button>
        <button
          class="ml-auto px-4 py-2 ui-success-bg rounded-md text-sm font-semibold hover:bg-(--ui-success-strong) transition-colors flex items-center gap-2"
          @click="saveRecipients"
        >
          <Icon
            icon="check"
            class="w-4 h-4"
          />
          Save Recipients
        </button>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.reminder-config-wrapper {
  @apply w-full;
}

/* Custom scrollbar for modal */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>