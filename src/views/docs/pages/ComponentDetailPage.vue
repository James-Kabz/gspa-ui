<script setup>
import { computed, markRaw, onErrorCaptured, ref, shallowRef, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getComponentDocBySlug, getComponentDocs, loadComponentBySlug } from '../componentDocs.js'

const route = useRoute()

const copiedKey = ref('')
const loading = ref(false)
const loadError = ref('')
const previewError = ref('')
const loadedComponent = shallowRef(null)
const playgroundValues = ref({})
const initialPlaygroundValues = ref({})
const jsonDrafts = ref({})
const jsonErrors = ref({})

const componentSlug = computed(() => (route.params.componentSlug || '').toString())
const componentDoc = computed(() => getComponentDocBySlug(componentSlug.value))

const componentPlaygroundPresets = {
  Button: {
    slot: 'Save Changes',
    props: {
      variant: 'primary',
      size: 'default',
      disabled: false,
      loading: false
    }
  },
  Input: {
    props: {
      modelValue: 'Sample text',
      placeholder: 'Type here',
      clearable: true
    }
  },
  Select: {
    props: {
      modelValue: 'starter',
      placeholder: 'Pick a plan',
      options: [
        { value: 'starter', label: 'Starter' },
        { value: 'growth', label: 'Growth' },
        { value: 'enterprise', label: 'Enterprise' }
      ]
    }
  },
  Checkbox: {
    props: {
      modelValue: false,
      label: 'Enable notifications'
    }
  },
  Badge: {
    slot: 'Status',
    props: {
      variant: 'secondary'
    }
  },
  Alert: {
    props: {
      title: 'Heads up',
      description: 'This is an alert preview.',
      variant: 'info'
    }
  },
  DataTable: {
    props: {
      title: 'Team Directory',
      description: 'Sample records for sorting, selection, and pagination.',
      selectable: true,
      striped: true,
      hoverable: true,
      showPagination: true,
      pageSize: 5,
      rowKey: 'id',
      columns: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'role', label: 'Role', sortable: true },
        { key: 'department', label: 'Department', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'location', label: 'Location', sortable: true }
      ],
      data: [
        { id: 1, name: 'Amina Njeri', role: 'Product Manager', department: 'Product', status: 'Active', location: 'Nairobi' },
        { id: 2, name: 'Brian Otieno', role: 'Frontend Engineer', department: 'Engineering', status: 'Active', location: 'Kisumu' },
        { id: 3, name: 'Clara Wanjiku', role: 'UX Designer', department: 'Design', status: 'On Leave', location: 'Mombasa' },
        { id: 4, name: 'Daniel Kiptoo', role: 'Data Analyst', department: 'Analytics', status: 'Active', location: 'Eldoret' },
        { id: 5, name: 'Esther Muthoni', role: 'Finance Lead', department: 'Finance', status: 'Active', location: 'Nakuru' },
        { id: 6, name: 'Farah Noor', role: 'Customer Success', department: 'Operations', status: 'Inactive', location: 'Garissa' },
        { id: 7, name: 'George Maina', role: 'Backend Engineer', department: 'Engineering', status: 'Active', location: 'Thika' },
        { id: 8, name: 'Halima Yusuf', role: 'HR Partner', department: 'People', status: 'Active', location: 'Nairobi' }
      ],
      actions: [
        { key: 'view', label: 'View', icon: 'eye', variant: 'info', tooltip: 'Inspect this record', permission: true },
        { key: 'edit', label: 'Edit', icon: 'pen', variant: 'secondary', tooltip: 'Update this record', permission: true },
        { key: 'archive', label: 'Archive', icon: 'archive', variant: 'warning', tooltip: 'Archive this record', permission: true }
      ]
    }
  },
  Progress: {
    props: {
      value: 45
    }
  },
  Avatar: {
    props: {
      fallback: 'UI'
    }
  },
  ReusableForm: {
    props: {
      title: 'Create Company',
      description: 'Sectioned form with external actions',
      entityName: 'Company',
      showSubmit: false,
      fields: [
        {
          name: 'company_name',
          label: 'Company Name',
          type: 'text',
          required: true,
          placeholder: 'Savannah Holdings',
          wrapperClass: 'col-span-12 md:col-span-8'
        },
        {
          name: 'company_code',
          label: 'Company Code',
          type: 'text',
          required: true,
          placeholder: 'SAV-001',
          wrapperClass: 'col-span-12 md:col-span-4'
        },
        {
          name: 'admin_email',
          label: 'Admin Email',
          type: 'email',
          required: true,
          placeholder: 'admin@savannah.com',
          wrapperClass: 'col-span-12 md:col-span-6'
        },
        {
          name: 'timezone',
          label: 'Timezone',
          type: 'select',
          required: true,
          options: [
            { label: 'Africa/Nairobi', value: 'Africa/Nairobi' },
            { label: 'UTC', value: 'UTC' }
          ],
          wrapperClass: 'col-span-12 md:col-span-6'
        }
      ],
      sections: [
        {
          id: 'identity',
          title: 'Identity',
          description: 'Core company information',
          fields: [
            {
              name: 'company_name',
              label: 'Company Name',
              type: 'text',
              required: true,
              placeholder: 'Savannah Holdings',
              wrapperClass: 'col-span-12 md:col-span-8'
            },
            {
              name: 'company_code',
              label: 'Company Code',
              type: 'text',
              required: true,
              placeholder: 'SAV-001',
              wrapperClass: 'col-span-12 md:col-span-4'
            }
          ]
        },
        {
          id: 'settings',
          title: 'Settings',
          description: 'Default account setup',
          fields: [
            {
              name: 'admin_email',
              label: 'Admin Email',
              type: 'email',
              required: true,
              placeholder: 'admin@savannah.com',
              wrapperClass: 'col-span-12 md:col-span-6'
            },
            {
              name: 'timezone',
              label: 'Timezone',
              type: 'select',
              required: true,
              options: [
                { label: 'Africa/Nairobi', value: 'Africa/Nairobi' },
                { label: 'UTC', value: 'UTC' }
              ],
              wrapperClass: 'col-span-12 md:col-span-6'
            }
          ]
        }
      ]
    }
  },
  ReusableFormModal: {
    props: {
      modelValue: false,
      modalType: 'create',
      entityName: 'Company',
      showSubmit: false,
      fields: [
        {
          name: 'company_name',
          label: 'Company Name',
          type: 'text',
          required: true,
          placeholder: 'Savannah Holdings',
          wrapperClass: 'col-span-12 md:col-span-8'
        },
        {
          name: 'company_code',
          label: 'Company Code',
          type: 'text',
          required: true,
          placeholder: 'SAV-001',
          wrapperClass: 'col-span-12 md:col-span-4'
        },
        {
          name: 'admin_email',
          label: 'Admin Email',
          type: 'email',
          required: true,
          placeholder: 'admin@savannah.com',
          wrapperClass: 'col-span-12 md:col-span-6'
        },
        {
          name: 'timezone',
          label: 'Timezone',
          type: 'select',
          required: true,
          options: [
            { label: 'Africa/Nairobi', value: 'Africa/Nairobi' },
            { label: 'UTC', value: 'UTC' }
          ],
          wrapperClass: 'col-span-12 md:col-span-6'
        }
      ],
      sections: [
        {
          id: 'identity',
          title: 'Identity',
          description: 'Core company information',
          fields: [
            {
              name: 'company_name',
              label: 'Company Name',
              type: 'text',
              required: true,
              placeholder: 'Savannah Holdings',
              wrapperClass: 'col-span-12 md:col-span-8'
            },
            {
              name: 'company_code',
              label: 'Company Code',
              type: 'text',
              required: true,
              placeholder: 'SAV-001',
              wrapperClass: 'col-span-12 md:col-span-4'
            }
          ]
        },
        {
          id: 'settings',
          title: 'Settings',
          description: 'Default account setup',
          fields: [
            {
              name: 'admin_email',
              label: 'Admin Email',
              type: 'email',
              required: true,
              placeholder: 'admin@savannah.com',
              wrapperClass: 'col-span-12 md:col-span-6'
            },
            {
              name: 'timezone',
              label: 'Timezone',
              type: 'select',
              required: true,
              options: [
                { label: 'Africa/Nairobi', value: 'Africa/Nairobi' },
                { label: 'UTC', value: 'UTC' }
              ],
              wrapperClass: 'col-span-12 md:col-span-6'
            }
          ]
        }
      ]
    }
  },
  EventsCalendar: {
    props: {
      size: 'compact',
      minHeight: '520px',
      events: [
        { id: 1, title: 'Ops Standup', date: '2026-04-07', time: '09:00', color: 'blue' },
        { id: 2, title: 'Tax Filing Deadline', date: '2026-04-07', color: 'red' },
        { id: 3, title: 'Board Prep', date: '2026-04-07', time: '14:00', color: 'orange' },
        { id: 4, title: 'Vendor Review', date: '2026-04-07', time: '16:00', color: 'green' },
        { id: 5, title: 'Legal Checkpoint', date: '2026-04-10', color: 'purple' },
        { id: 6, title: 'Audit Kickoff', date: '2026-04-14', time: '11:00', color: 'blue' },
        { id: 7, title: 'Compliance Committee', date: '2026-04-14', time: '13:00', color: 'green' },
        { id: 8, title: 'Policy Refresh', date: '2026-04-18', color: 'orange' },
        { id: 9, title: 'Contract Renewal', date: '2026-04-21', time: '10:00', color: 'red' },
        { id: 10, title: 'Risk Workshop', date: '2026-04-23', time: '15:00', color: 'purple' },
        { id: 11, title: 'Quarter Close', date: '2026-04-29', color: 'blue' }
      ]
    }
  }
}

const runtimeComponent = computed(() => {
  return loadedComponent.value?.__vccOpts || loadedComponent.value || null
})

const relatedComponents = computed(() => {
  if (!componentDoc.value) return []

  return getComponentDocs()
    .filter((entry) => entry.category === componentDoc.value.category && entry.slug !== componentDoc.value.slug)
    .slice(0, 8)
})

const parseTypeName = (typeValue) => {
  if (!typeValue) return 'any'

  if (Array.isArray(typeValue)) {
    return typeValue.map((entry) => parseTypeName(entry)).join(' | ')
  }

  if (typeof typeValue === 'function') {
    return typeValue.name || 'Function'
  }

  if (typeof typeValue === 'string') {
    return typeValue
  }

  return typeValue.constructor?.name || 'Object'
}

const resolveTypeList = (definition) => {
  if (!definition) return ['any']

  if (Array.isArray(definition)) {
    return definition.map((entry) => parseTypeName(entry))
  }

  if (typeof definition === 'function') {
    return [parseTypeName(definition)]
  }

  if (definition.type) {
    if (Array.isArray(definition.type)) {
      return definition.type.map((entry) => parseTypeName(entry))
    }

    return [parseTypeName(definition.type)]
  }

  return ['any']
}

const cloneValue = (value) => {
  if (value === undefined || value === null) return value
  if (typeof value !== 'object') return value

  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return value
  }
}

const defaultValueFromTypes = (types) => {
  if (types.includes('Boolean')) return false
  if (types.includes('Number')) return 0
  if (types.includes('Array')) return []
  if (types.includes('Object')) return {}
  return ''
}

const readDefaultValue = (definition, types) => {
  if (!definition || typeof definition !== 'object') return undefined
  if (!Object.prototype.hasOwnProperty.call(definition, 'default')) return undefined

  const defaultValue = definition.default

  if (typeof defaultValue !== 'function') return cloneValue(defaultValue)

  if (types.includes('Function')) return defaultValue

  try {
    return cloneValue(defaultValue())
  } catch {
    return undefined
  }
}

const propSchema = computed(() => {
  const propsDefinition = runtimeComponent.value?.props
  if (!propsDefinition) return []

  if (Array.isArray(propsDefinition)) {
    return propsDefinition.map((name) => ({
      name,
      definition: null,
      required: false,
      types: ['any']
    }))
  }

  return Object.entries(propsDefinition).map(([name, definition]) => {
    if (Array.isArray(definition) || typeof definition === 'function') {
      return {
        name,
        definition: null,
        required: false,
        types: resolveTypeList(definition)
      }
    }

    return {
      name,
      definition,
      required: Boolean(definition?.required),
      types: resolveTypeList(definition)
    }
  })
})

const propRows = computed(() => {
  return propSchema.value.map((entry) => {
    const defaultValue = readDefaultValue(entry.definition, entry.types)

    return {
      name: entry.name,
      type: entry.types.join(' | '),
      required: entry.required,
      defaultValue: defaultValue === undefined
        ? 'N/A'
        : typeof defaultValue === 'string'
          ? defaultValue
          : JSON.stringify(defaultValue)
    }
  })
})

const propControls = computed(() => {
  return propSchema.value
    .filter((entry) => !['class', 'style', 'key', 'ref'].includes(entry.name))
    .map((entry) => {
      let control = 'text'

      if (entry.types.includes('Boolean')) {
        control = 'boolean'
      } else if (entry.types.includes('Number')) {
        control = 'number'
      } else if (entry.types.includes('Object') || entry.types.includes('Array')) {
        control = 'json'
      }

      return {
        ...entry,
        control,
        typeLabel: entry.types.join(' | ')
      }
    })
})

const previewSlotText = computed(() => {
  if (!componentDoc.value) return ''

  const preset = componentPlaygroundPresets[componentDoc.value.name]
  return preset?.slot || `${componentDoc.value.name} preview`
})

const playgroundBindings = computed(() => {
  return { ...playgroundValues.value }
})

const initializePlayground = () => {
  if (!componentDoc.value) {
    playgroundValues.value = {}
    initialPlaygroundValues.value = {}
    jsonDrafts.value = {}
    jsonErrors.value = {}
    return
  }

  const preset = componentPlaygroundPresets[componentDoc.value.name]?.props || {}
  const values = {}
  const drafts = {}

  for (const entry of propControls.value) {
    let value

    if (Object.prototype.hasOwnProperty.call(preset, entry.name)) {
      value = cloneValue(preset[entry.name])
    } else {
      const defaultValue = readDefaultValue(entry.definition, entry.types)
      if (defaultValue !== undefined) {
        value = cloneValue(defaultValue)
      } else if (entry.required) {
        value = defaultValueFromTypes(entry.types)
      } else if (entry.name === 'modelValue') {
        value = defaultValueFromTypes(entry.types)
      }
    }

    if (value !== undefined) {
      values[entry.name] = value

      if (entry.control === 'json') {
        drafts[entry.name] = JSON.stringify(value, null, 2)
      }
    }
  }

  playgroundValues.value = values
  initialPlaygroundValues.value = cloneValue(values) || {}
  jsonDrafts.value = drafts
  jsonErrors.value = {}
  previewError.value = ''
}

const resetPlayground = () => {
  playgroundValues.value = cloneValue(initialPlaygroundValues.value) || {}

  const drafts = {}
  for (const control of propControls.value) {
    if (control.control !== 'json') continue

    const value = playgroundValues.value[control.name]
    drafts[control.name] = value === undefined ? '' : JSON.stringify(value, null, 2)
  }

  jsonDrafts.value = drafts
  jsonErrors.value = {}
  previewError.value = ''
}

const updateBooleanProp = (name, event) => {
  playgroundValues.value[name] = event.target.checked
}

const updateNumberProp = (name, event) => {
  const incoming = event.target.value

  if (incoming === '') {
    playgroundValues.value[name] = ''
    return
  }

  const parsed = Number(incoming)
  if (!Number.isNaN(parsed)) {
    playgroundValues.value[name] = parsed
  }
}

const updateTextProp = (name, event) => {
  playgroundValues.value[name] = event.target.value
}

const updateJsonProp = (name, event) => {
  const incoming = event.target.value
  jsonDrafts.value[name] = incoming

  if (!incoming.trim()) {
    delete jsonErrors.value[name]
    playgroundValues.value[name] = undefined
    return
  }

  try {
    const parsed = JSON.parse(incoming)
    playgroundValues.value[name] = parsed
    delete jsonErrors.value[name]
  } catch {
    jsonErrors.value[name] = 'Invalid JSON'
  }
}

const handleModelValueUpdate = (value) => {
  playgroundValues.value.modelValue = value
}

const copySnippet = async (key, content) => {
  if (!navigator?.clipboard) return

  await navigator.clipboard.writeText(content)
  copiedKey.value = key

  window.setTimeout(() => {
    if (copiedKey.value === key) copiedKey.value = ''
  }, 1200)
}

const loadRuntimeComponent = async () => {
  loading.value = true
  loadError.value = ''
  previewError.value = ''
  loadedComponent.value = null

  if (!componentDoc.value) {
    loading.value = false
    initializePlayground()
    return
  }

  try {
    const componentModule = await loadComponentBySlug(componentSlug.value)
    loadedComponent.value = componentModule ? markRaw(componentModule) : null
    initializePlayground()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Failed to load component metadata.'
    initializePlayground()
  } finally {
    loading.value = false
  }
}

onErrorCaptured((error) => {
  previewError.value = error instanceof Error ? error.message : 'Preview failed to render with current props.'
  return false
})

watch(componentSlug, loadRuntimeComponent, { immediate: true })
</script>

<template>
  <div class="space-y-8">
    <article
      v-if="!componentDoc"
      class="rounded-2xl border ui-border-strong ui-surface p-6"
    >
      <h1 class="text-3xl font-bold">
        Component not found
      </h1>
      <p class="mt-3 text-lg leading-8 ui-text-muted">
        The requested component route does not exist in the exported component registry.
      </p>
      <RouterLink
        to="/components/components"
        class="mt-4 inline-flex rounded-md border ui-border-strong px-3 py-1.5 text-sm font-medium hover:bg-(--ui-surface-soft)"
      >
        Back to Components
      </RouterLink>
    </article>

    <template v-else>
      <article class="rounded-2xl border ui-border-strong ui-surface p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide ui-text-muted">
              {{ componentDoc.category }}
            </p>
            <h1 class="mt-1 text-3xl font-bold">
              {{ componentDoc.name }}
            </h1>
            <p class="mt-2 text-sm ui-text-muted">
              {{ componentDoc.description }}
            </p>
          </div>

          <RouterLink
            to="/components/components"
            class="rounded-md border ui-border-strong px-3 py-1.5 text-sm font-medium hover:bg-(--ui-surface-soft)"
          >
            All components
          </RouterLink>
        </div>

        <p
          v-if="componentDoc.sourcePath"
          class="mt-4 rounded-md border ui-border-strong bg-(--ui-surface-soft) px-3 py-2 text-xs ui-text-muted"
        >
          Source: {{ componentDoc.sourcePath }}
        </p>
      </article>

      <article class="rounded-2xl border ui-border-strong ui-surface p-6">
        <h2 class="text-2xl font-bold">
          Usage
        </h2>

        <div class="mt-4 rounded-xl border ui-border-strong bg-black/92 p-4">
          <div class="mb-2 flex items-center justify-between gap-3">
            <p class="text-xs font-semibold uppercase tracking-wide text-white/80">
              Import
            </p>
            <button
              type="button"
              class="rounded-md border border-white/30 px-3 py-1 text-xs font-medium text-white hover:bg-white/10"
              @click="copySnippet('import', componentDoc.importSnippet)"
            >
              {{ copiedKey === 'import' ? 'Copied' : 'Copy' }}
            </button>
          </div>
          <pre class="overflow-x-auto text-xs text-white"><code>{{ componentDoc.importSnippet }}</code></pre>
        </div>

        <div class="mt-4 rounded-xl border ui-border-strong bg-black/92 p-4">
          <div class="mb-2 flex items-center justify-between gap-3">
            <p class="text-xs font-semibold uppercase tracking-wide text-white/80">
              Template usage
            </p>
            <button
              type="button"
              class="rounded-md border border-white/30 px-3 py-1 text-xs font-medium text-white hover:bg-white/10"
              @click="copySnippet('usage', componentDoc.usageSnippet)"
            >
              {{ copiedKey === 'usage' ? 'Copied' : 'Copy' }}
            </button>
          </div>
          <pre class="overflow-x-auto text-xs text-white"><code>{{ componentDoc.usageSnippet }}</code></pre>
        </div>
      </article>

      <article class="rounded-2xl border ui-border-strong ui-surface p-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-2xl font-bold">
            Live Playground
          </h2>
          <button
            type="button"
            class="rounded-md border ui-border-strong px-3 py-1.5 text-sm font-medium hover:bg-(--ui-surface-soft)"
            @click="resetPlayground"
          >
            Reset Props
          </button>
        </div>

        <p class="mt-2 text-sm ui-text-muted">
          Edit props and preview the component in real time.
        </p>

        <div class="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)]">
          <div class="rounded-xl border ui-border-strong ui-surface-soft p-4">
            <p class="text-xs font-semibold uppercase tracking-wide ui-text-muted">
              Preview
            </p>

            <div class="mt-3 rounded-lg border ui-border-strong ui-surface p-4">
              <p
                v-if="loading"
                class="text-sm ui-text-muted"
              >
                Loading component preview...
              </p>

              <p
                v-else-if="loadError"
                class="text-sm ui-danger"
              >
                {{ loadError }}
              </p>

              <p
                v-else-if="previewError"
                class="text-sm ui-danger"
              >
                {{ previewError }}
              </p>

              <component
                :is="loadedComponent"
                v-else-if="loadedComponent"
                v-bind="playgroundBindings"
                @update:model-value="handleModelValueUpdate"
              >
                {{ previewSlotText }}
              </component>
            </div>
          </div>

          <div class="rounded-xl border ui-border-strong ui-surface-soft p-4">
            <p class="text-xs font-semibold uppercase tracking-wide ui-text-muted">
              Props Controls
            </p>

            <div class="mt-3 space-y-3">
              <div
                v-for="control in propControls"
                :key="control.name"
                class="rounded-lg border ui-border-strong ui-surface p-3"
              >
                <div class="mb-2 flex items-center justify-between gap-2">
                  <p class="text-sm font-medium">
                    {{ control.name }}
                  </p>
                  <span class="text-xs ui-text-muted">
                    {{ control.typeLabel }}
                  </span>
                </div>

                <template v-if="control.control === 'boolean'">
                  <label class="inline-flex items-center gap-2 text-sm ui-text-muted">
                    <input
                      type="checkbox"
                      :checked="Boolean(playgroundValues[control.name])"
                      @change="updateBooleanProp(control.name, $event)"
                    >
                    {{ Boolean(playgroundValues[control.name]) ? 'true' : 'false' }}
                  </label>
                </template>

                <template v-else-if="control.control === 'number'">
                  <input
                    type="number"
                    class="w-full rounded-md border ui-border-strong bg-(--ui-surface) px-3 py-2 text-sm"
                    :value="playgroundValues[control.name]"
                    @input="updateNumberProp(control.name, $event)"
                  >
                </template>

                <template v-else-if="control.control === 'json'">
                  <textarea
                    class="min-h-24 w-full rounded-md border ui-border-strong bg-(--ui-surface) px-3 py-2 text-xs font-mono"
                    :value="jsonDrafts[control.name]"
                    @input="updateJsonProp(control.name, $event)"
                  />
                  <p
                    v-if="jsonErrors[control.name]"
                    class="mt-1 text-xs ui-danger"
                  >
                    {{ jsonErrors[control.name] }}
                  </p>
                </template>

                <template v-else>
                  <input
                    type="text"
                    class="w-full rounded-md border ui-border-strong bg-(--ui-surface) px-3 py-2 text-sm"
                    :value="playgroundValues[control.name]"
                    @input="updateTextProp(control.name, $event)"
                  >
                </template>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article class="rounded-2xl border ui-border-strong ui-surface p-6">
        <h2 class="text-2xl font-bold">
          Props
        </h2>

        <p
          v-if="loading"
          class="mt-3 text-sm ui-text-muted"
        >
          Loading props metadata...
        </p>

        <p
          v-else-if="loadError"
          class="mt-3 text-sm ui-danger"
        >
          {{ loadError }}
        </p>

        <p
          v-else-if="propRows.length === 0"
          class="mt-3 text-sm ui-text-muted"
        >
          No runtime props were detected for this component.
        </p>

        <div
          v-else
          class="mt-4 overflow-x-auto rounded-xl border ui-border-strong"
        >
          <table class="min-w-full divide-y ui-border-strong">
            <thead class="ui-surface-soft">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ui-text-muted">
                  Prop
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ui-text-muted">
                  Type
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ui-text-muted">
                  Required
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ui-text-muted">
                  Default
                </th>
              </tr>
            </thead>
            <tbody class="divide-y ui-border-strong">
              <tr
                v-for="prop in propRows"
                :key="prop.name"
              >
                <td class="whitespace-nowrap px-4 py-3 text-sm font-medium">
                  {{ prop.name }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-sm ui-text-muted">
                  {{ prop.type }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-sm ui-text-muted">
                  {{ prop.required ? 'Yes' : 'No' }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-sm ui-text-muted">
                  {{ prop.defaultValue }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article
        v-if="relatedComponents.length"
        class="rounded-2xl border ui-border-strong ui-surface p-6"
      >
        <h2 class="text-2xl font-bold">
          Related in {{ componentDoc.category }}
        </h2>

        <div class="mt-4 flex flex-wrap gap-2">
          <RouterLink
            v-for="entry in relatedComponents"
            :key="entry.slug"
            :to="`/components/components/${entry.slug}`"
            class="rounded-md border ui-border-strong px-3 py-1.5 text-sm font-medium hover:bg-(--ui-surface-soft)"
          >
            {{ entry.name }}
          </RouterLink>
        </div>
      </article>
    </template>
  </div>
</template>
