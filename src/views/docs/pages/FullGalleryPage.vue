<script setup>
import { computed, markRaw, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Input from '../../../components/Input.vue'
import ComponentPreviewCard from '../components/ComponentPreviewCard.vue'
import { categoryOrder, getComponentDocs, loadComponentBySlug } from '../componentDocs.js'

const searchQuery = ref('')
const loading = ref(true)
const entries = ref([])

const sampleOptions = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
  { label: 'Option C', value: 'c' }
]

const sampleRows = [
  { id: 1, name: 'Jordan Blake', email: 'jordan@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Casey Moore', email: 'casey@example.com', role: 'Manager', status: 'pending' }
]

const sampleBarChartData = [42, 58, 71, 65, 80]
const sampleLineChartData = [14, 26, 19, 33, 29]
const sampleChartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May']
const sampleStackedData = [
  { complied: 62, uncomplied: 38 },
  { complied: 55, uncomplied: 45 },
  { complied: 74, uncomplied: 26 },
  { complied: 68, uncomplied: 32 }
]
const sampleStackedLabels = ['Q1', 'Q2', 'Q3', 'Q4']

const sampleColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' }
]

const sampleFields = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    required: true,
    placeholder: 'Jordan Blake',
    wrapperClass: 'col-span-12 md:col-span-6'
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    placeholder: 'jordan@example.com',
    wrapperClass: 'col-span-12 md:col-span-6'
  }
]

const sectionedSampleFields = [
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
]

const sampleSections = [
  {
    id: 'identity',
    title: 'Identity',
    description: 'Core company information',
    fields: sectionedSampleFields.slice(0, 2)
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Default account setup',
    fields: sectionedSampleFields.slice(2)
  }
]

const componentExamplePresets = {
  Button: [
    { label: 'Primary', props: { variant: 'primary', size: 'default' }, slot: 'Save' },
    { label: 'Outline', props: { variant: 'outline', size: 'default' }, slot: 'Cancel' }
  ],
  Badge: [
    { label: 'Info', props: { variant: 'info' }, slot: 'Info' },
    { label: 'Success', props: { variant: 'success' }, slot: 'Success' }
  ],
  Input: [
    { label: 'Text', props: { modelValue: 'Preview text', placeholder: 'Type here', clearable: true } }
  ],
  Select: [
    { label: 'Select', props: { modelValue: 'a', options: sampleOptions, placeholder: 'Pick an option' } }
  ],
  Checkbox: [
    { label: 'Unchecked', props: { modelValue: false, label: 'Enable notifications' } },
    { label: 'Checked', props: { modelValue: true, label: 'Enable notifications' } }
  ],
  Progress: [
    { label: 'Progress', props: { value: 45 } }
  ],
  Avatar: [
    { label: 'Initials', props: { initials: 'KV' } }
  ],
  Alert: [
    { label: 'Info', props: { title: 'Heads up', description: 'Alert preview', variant: 'info' } }
  ],
  BarChart: [
    {
      label: 'Default',
      props: { data: sampleBarChartData, labels: sampleChartLabels, width: 420, height: 260 }
    }
  ],
  LineChart: [
    {
      label: 'Default',
      props: { data: sampleLineChartData, labels: sampleChartLabels, width: 420, height: 260 }
    }
  ],
  StackedBarChart: [
    {
      label: 'Default',
      props: {
        data: sampleStackedData,
        labels: sampleStackedLabels,
        width: 420,
        height: 260,
        maxValue: 100
      }
    }
  ],
  DataTable: [
    { label: 'DataTable', props: { data: sampleRows, columns: sampleColumns, showPagination: false } }
  ],
  ReusableForm: [
    {
      label: 'Sectioned Form',
      props: {
        title: 'Create Company',
        description: 'ReusableForm v2 section layout',
        entityName: 'Company',
        fields: sectionedSampleFields,
        sections: sampleSections,
        showSubmit: false
      }
    }
  ],
  ReusableFormModal: [
    {
      label: 'Sectioned Modal',
      props: {
        modelValue: false,
        modalType: 'create',
        entityName: 'Company',
        fields: sectionedSampleFields,
        sections: sampleSections,
        showSubmit: false
      }
    }
  ],
  Breadcrumb: [
    {
      label: 'Default',
      props: {
        items: [
          { label: 'Dashboard', href: '#' },
          { label: 'Components' }
        ],
        separator: 'chevron-right',
        ariaLabel: 'Breadcrumb navigation',
        variant: 'default'
      }
    }
  ]
}

const slotComponents = new Set(['Button', 'Badge', 'Text', 'Link', 'Option'])
const previewDisabledComponents = new Set(['DefaultLayout', 'AuthLayout', 'ErrorLayout', 'TabPanel'])

const specialDefaults = {
  options: () => sampleOptions,
  items: () => [
    { id: 'item-1', title: 'First item', content: 'Item content' },
    { id: 'item-2', title: 'Second item', content: 'Another item content' }
  ],
  columns: () => sampleColumns,
  data: () => sampleRows,
  fields: () => sampleFields,
  sections: () => sampleSections,
  modalType: () => 'create',
  entityName: () => 'Item',
  title: () => 'Sample title',
  description: () => 'Sample description',
  label: () => 'Sample label',
  placeholder: () => 'Sample placeholder',
  src: () => 'https://robohash.org/mail@ashallendesign.co.uk',
  initials: () => 'KV',
  show: () => false,
  modelValue: (types) => {
    if (types.includes('Boolean')) return false
    if (types.includes('Number')) return 10
    if (types.includes('Array')) return []
    if (types.includes('Object')) return {}
    return 'Sample value'
  }
}

const parseTypeName = (typeValue) => {
  if (!typeValue) return 'any'

  if (Array.isArray(typeValue)) {
    return typeValue.flatMap((entry) => parseTypeName(entry))
  }

  if (typeof typeValue === 'function') {
    return [typeValue.name || 'Function']
  }

  if (typeof typeValue === 'string') {
    return [typeValue]
  }

  return [typeValue.constructor?.name || 'Object']
}

const resolveTypeList = (definition) => {
  if (!definition) return ['any']

  if (Array.isArray(definition) || typeof definition === 'function') {
    return parseTypeName(definition)
  }

  if (definition.type) {
    return parseTypeName(definition.type)
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

const defaultByTypes = (types) => {
  if (types.includes('Boolean')) return false
  if (types.includes('Number')) return 0
  if (types.includes('Array')) return []
  if (types.includes('Object')) return {}
  return ''
}

const readRuntimeDefault = (definition, types) => {
  if (!definition || typeof definition !== 'object') return undefined
  if (!Object.prototype.hasOwnProperty.call(definition, 'default')) return undefined

  const runtimeDefault = definition.default

  if (typeof runtimeDefault !== 'function') return cloneValue(runtimeDefault)
  if (types.includes('Function')) return runtimeDefault

  try {
    return cloneValue(runtimeDefault())
  } catch {
    return undefined
  }
}

const toDefaultDisplay = (value) => {
  if (value === undefined) return 'N/A'
  if (value === null) return 'null'
  if (typeof value === 'string') return value
  if (typeof value === 'function') return '[Function]'

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const buildPropRows = (propsDefinition) => {
  if (!propsDefinition) return []

  if (Array.isArray(propsDefinition)) {
    return propsDefinition.map((name) => ({
      name,
      type: 'any',
      required: false,
      defaultValue: 'N/A'
    }))
  }

  return Object.entries(propsDefinition).map(([name, definition]) => {
    if (Array.isArray(definition) || typeof definition === 'function') {
      return {
        name,
        type: resolveTypeList(definition).join(' | '),
        required: false,
        defaultValue: 'N/A'
      }
    }

    const types = resolveTypeList(definition)
    const runtimeDefault = readRuntimeDefault(definition, types)

    return {
      name,
      type: types.join(' | '),
      required: Boolean(definition?.required),
      defaultValue: toDefaultDisplay(runtimeDefault)
    }
  })
}

const buildPropControls = (propsDefinition) => {
  if (!propsDefinition) return []

  const normalizedEntries = Array.isArray(propsDefinition)
    ? propsDefinition.map((name) => [name, null])
    : Object.entries(propsDefinition)

  return normalizedEntries
    .filter(([name]) => !['class', 'style', 'key', 'ref'].includes(name))
    .map(([name, definition]) => {
      const types = resolveTypeList(definition)
      let control = 'text'

      if (types.includes('Boolean')) {
        control = 'boolean'
      } else if (types.includes('Number')) {
        control = 'number'
      } else if (types.includes('Object') || types.includes('Array')) {
        control = 'json'
      }

      return {
        name,
        types,
        typeLabel: types.join(' | '),
        required: Boolean(definition?.required),
        control
      }
    })
}

const buildInteractiveProps = (componentName, propsDefinition, examples) => {
  const initial = {}
  const firstExample = examples?.[0]?.props || {}

  Object.assign(initial, cloneValue(firstExample) || {})

  const autoBindings = buildAutoBindings(componentName, propsDefinition)
  for (const [propName, value] of Object.entries(autoBindings)) {
    if (!Object.prototype.hasOwnProperty.call(initial, propName)) {
      initial[propName] = cloneValue(value)
    }
  }

  return initial
}

const buildAutoBindings = (componentName, propsDefinition) => {
  if (!propsDefinition) return {}

  const output = {}

  const normalizedEntries = Array.isArray(propsDefinition)
    ? propsDefinition.map((name) => [name, null])
    : Object.entries(propsDefinition)

  for (const [propName, definition] of normalizedEntries) {
    const types = resolveTypeList(definition)
    const required = Boolean(definition?.required)

    let value

    if (specialDefaults[propName]) {
      const resolver = specialDefaults[propName]
      value = cloneValue(typeof resolver === 'function' ? resolver(types, componentName) : resolver)
    } else {
      value = readRuntimeDefault(definition, types)

      if (value === undefined && required) {
        value = defaultByTypes(types)
      }
    }

    if (value !== undefined) {
      output[propName] = value
    }
  }

  return output
}

const defaultSlotText = (componentName) => {
  if (!slotComponents.has(componentName)) return ''
  return `${componentName} example`
}

const loadEntries = async () => {
  loading.value = true

  const docs = getComponentDocs()

  const loadedEntries = await Promise.all(
    docs.map(async (docEntry) => {
      try {
        const loadedComponent = await loadComponentBySlug(docEntry.slug)
        const safeLoadedComponent = loadedComponent ? markRaw(loadedComponent) : null
        const runtimeComponent = safeLoadedComponent?.__vccOpts || safeLoadedComponent || null
        const propRows = buildPropRows(runtimeComponent?.props)
        const propControls = buildPropControls(runtimeComponent?.props)

        const presetExamples = componentExamplePresets[docEntry.name]
        const examples = presetExamples
          ? presetExamples.map((example) => ({
              label: example.label,
              props: { ...example.props },
              slot: example.slot || defaultSlotText(docEntry.name)
            }))
          : [
              {
                label: 'Default',
                props: buildAutoBindings(docEntry.name, runtimeComponent?.props),
                slot: defaultSlotText(docEntry.name)
              }
            ]
        const interactiveProps = buildInteractiveProps(docEntry.name, runtimeComponent?.props, examples)
        const interactiveJsonDrafts = {}
        for (const control of propControls) {
          if (control.control !== 'json') continue

          const value = interactiveProps[control.name]
          interactiveJsonDrafts[control.name] = value === undefined ? '' : JSON.stringify(value, null, 2)
        }

        return {
          ...docEntry,
          loadedComponent: safeLoadedComponent,
          previewDisabled: previewDisabledComponents.has(docEntry.name),
          previewDisabledReason: previewDisabledComponents.has(docEntry.name)
            ? docEntry.name === 'TabPanel'
              ? 'Preview disabled in gallery. TabPanel must be used inside the Tab component.'
              : 'Preview disabled in gallery. This layout depends on full app context and child components.'
            : '',
          propRows,
          propControls,
          examples,
          interactiveProps,
          interactiveJsonDrafts,
          interactiveJsonErrors: {},
          loadError: ''
        }
      } catch (error) {
        return {
          ...docEntry,
          loadedComponent: null,
          previewDisabled: false,
          previewDisabledReason: '',
          propRows: [],
          propControls: [],
          examples: [],
          interactiveProps: {},
          interactiveJsonDrafts: {},
          interactiveJsonErrors: {},
          loadError: error instanceof Error ? error.message : 'Failed to load component.'
        }
      }
    })
  )

  entries.value = loadedEntries
  loading.value = false
}

const normalizedSearch = computed(() => searchQuery.value.trim().toLowerCase())

const groupedEntries = computed(() => {
  return categoryOrder
    .map((category) => {
      const items = entries.value.filter((entry) => {
        if (entry.category !== category) return false
        if (!normalizedSearch.value) return true
        return entry.name.toLowerCase().includes(normalizedSearch.value)
      })

      return {
        category,
        items
      }
    })
    .filter((group) => group.items.length > 0)
})

const updateInteractiveBoolean = (entry, propName, event) => {
  entry.interactiveProps[propName] = event.target.checked
}

const updateInteractiveNumber = (entry, propName, event) => {
  const incoming = event.target.value
  if (incoming === '') {
    entry.interactiveProps[propName] = ''
    return
  }

  const parsed = Number(incoming)
  if (!Number.isNaN(parsed)) {
    entry.interactiveProps[propName] = parsed
  }
}

const updateInteractiveText = (entry, propName, event) => {
  entry.interactiveProps[propName] = event.target.value
}

const updateInteractiveJson = (entry, propName, event) => {
  const incoming = event.target.value
  entry.interactiveJsonDrafts[propName] = incoming

  if (!incoming.trim()) {
    entry.interactiveProps[propName] = undefined
    delete entry.interactiveJsonErrors[propName]
    return
  }

  try {
    entry.interactiveProps[propName] = JSON.parse(incoming)
    delete entry.interactiveJsonErrors[propName]
  } catch {
    entry.interactiveJsonErrors[propName] = 'Invalid JSON'
  }
}

const handleInteractiveModelValue = (entry, value) => {
  entry.interactiveProps.modelValue = value
}

onMounted(loadEntries)
</script>

<template>
  <div class="min-h-screen ui-bg p-5 sm:p-8">
    <div class="mx-auto max-w-[1700px] space-y-6">
      <header class="rounded-2xl border ui-border-strong ui-surface p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.16em] ui-text-muted">
              Component Library
            </p>
            <h1 class="mt-2 text-3xl font-bold">
              Full Component Gallery
            </h1>
            <p class="mt-2 max-w-3xl text-sm ui-text-muted">
              Preview and test all components with live prop controls. This page is available from the docs
              Components page at `/components/full-gallery`.
            </p>
          </div>

          <RouterLink
            to="/components/components"
            class="rounded-md border ui-border-strong px-3 py-1.5 text-sm font-medium hover:bg-(--ui-surface-soft)"
          >
            Open Docs Components Page
          </RouterLink>
        </div>

        <div class="mt-4 max-w-sm">
          <Input
            v-model="searchQuery"
            placeholder="Filter components"
            clearable
          />
        </div>
      </header>

      <article
        v-if="loading"
        class="rounded-2xl border ui-border-strong ui-surface p-6"
      >
        <p class="text-sm ui-text-muted">
          Loading components...
        </p>
      </article>

      <section
        v-for="group in groupedEntries"
        :key="group.category"
        class="space-y-3"
      >
        <h2 class="text-xl font-semibold">
          {{ group.category }}
        </h2>

        <div class="grid gap-4 xl:grid-cols-1">
          <article
            v-for="entry in group.items"
            :key="entry.slug"
            class="rounded-2xl border ui-border-strong ui-surface p-4"
          >
            <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 class="text-lg font-semibold">
                  {{ entry.name }}
                </h3>
                <p class="text-xs ui-text-muted">
                  {{ entry.sourcePath || 'Source path unavailable' }}
                </p>
              </div>

              <RouterLink
                :to="`/components/components/${entry.slug}`"
                class="rounded-md border ui-border-strong px-2.5 py-1 text-xs font-medium hover:bg-(--ui-surface-soft)"
              >
                Detailed Playground
              </RouterLink>
            </div>

            <p
              v-if="entry.loadError"
              class="text-xs ui-danger"
            >
              Failed to load component: {{ entry.loadError }}
            </p>

            <div
              v-else-if="entry.previewDisabled"
              class="rounded-lg border ui-border-strong ui-surface-soft p-3"
            >
              <p class="text-xs ui-text-muted">
                {{ entry.previewDisabledReason }}
              </p>
            </div>

            <div
              v-else
              class="space-y-4"
            >
              <section class="space-y-1">
                <p class="text-[11px] font-semibold uppercase tracking-wide ui-text-muted">
                  Interactive Preview
                </p>
                <ComponentPreviewCard
                  :component="entry.loadedComponent"
                  :component-name="entry.name"
                  :bindings="entry.interactiveProps"
                  :slot-text="entry.examples[0]?.slot || ''"
                  @update:model-value="handleInteractiveModelValue(entry, $event)"
                />
              </section>

              <section
                v-if="entry.propControls.length > 0"
                class="space-y-2 rounded-lg border ui-border-strong p-3"
              >
                <p class="text-[11px] font-semibold uppercase tracking-wide ui-text-muted">
                  Edit Props
                </p>

                <div class="grid gap-2">
                  <div
                    v-for="control in entry.propControls"
                    :key="`${entry.slug}-control-${control.name}`"
                    class="rounded-md border ui-border-strong p-2"
                  >
                    <div class="mb-1 flex items-center justify-between gap-2">
                      <p class="text-xs font-medium">
                        {{ control.name }}
                      </p>
                      <span class="text-[11px] ui-text-muted">
                        {{ control.typeLabel }}
                      </span>
                    </div>

                    <template v-if="control.control === 'boolean'">
                      <label class="inline-flex items-center gap-2 text-xs ui-text-muted">
                        <input
                          type="checkbox"
                          :checked="Boolean(entry.interactiveProps[control.name])"
                          @change="updateInteractiveBoolean(entry, control.name, $event)"
                        >
                        {{ Boolean(entry.interactiveProps[control.name]) ? 'true' : 'false' }}
                      </label>
                    </template>

                    <template v-else-if="control.control === 'number'">
                      <input
                        type="number"
                        class="w-full rounded-md border ui-border-strong bg-(--ui-surface) px-2 py-1.5 text-xs"
                        :value="entry.interactiveProps[control.name]"
                        @input="updateInteractiveNumber(entry, control.name, $event)"
                      >
                    </template>

                    <template v-else-if="control.control === 'json'">
                      <textarea
                        class="min-h-20 w-full rounded-md border ui-border-strong bg-(--ui-surface) px-2 py-1.5 text-xs font-mono"
                        :value="entry.interactiveJsonDrafts[control.name]"
                        @input="updateInteractiveJson(entry, control.name, $event)"
                      />
                      <p
                        v-if="entry.interactiveJsonErrors[control.name]"
                        class="mt-1 text-[11px] ui-danger"
                      >
                        {{ entry.interactiveJsonErrors[control.name] }}
                      </p>
                    </template>

                    <template v-else>
                      <input
                        type="text"
                        class="w-full rounded-md border ui-border-strong bg-(--ui-surface) px-2 py-1.5 text-xs"
                        :value="entry.interactiveProps[control.name]"
                        @input="updateInteractiveText(entry, control.name, $event)"
                      >
                    </template>
                  </div>
                </div>
              </section>

              <section class="space-y-2">
                <p class="text-[11px] font-semibold uppercase tracking-wide ui-text-muted">
                  Preset Examples
                </p>
                <section
                  v-for="(example, index) in entry.examples"
                  :key="`${entry.slug}-${index}`"
                  class="space-y-1"
                >
                  <p class="text-[11px] font-semibold uppercase tracking-wide ui-text-muted">
                    {{ example.label }}
                  </p>
                  <ComponentPreviewCard
                    :component="entry.loadedComponent"
                    :component-name="entry.name"
                    :bindings="example.props"
                    :slot-text="example.slot"
                  />
                </section>
              </section>
            </div>

            <section class="mt-4">
              <p class="text-[11px] font-semibold uppercase tracking-wide ui-text-muted">
                Props ({{ entry.propRows.length }})
              </p>

              <p
                v-if="entry.propRows.length === 0"
                class="mt-2 text-xs ui-text-muted"
              >
                No runtime props detected.
              </p>

              <div
                v-else
                class="mt-2 overflow-x-auto rounded-lg border ui-border-strong"
              >
                <table class="min-w-full text-xs">
                  <thead class="ui-surface-soft">
                    <tr>
                      <th class="px-3 py-2 text-left font-semibold uppercase tracking-wide ui-text-muted">
                        Prop
                      </th>
                      <th class="px-3 py-2 text-left font-semibold uppercase tracking-wide ui-text-muted">
                        Type
                      </th>
                      <th class="px-3 py-2 text-left font-semibold uppercase tracking-wide ui-text-muted">
                        Required
                      </th>
                      <th class="px-3 py-2 text-left font-semibold uppercase tracking-wide ui-text-muted">
                        Default
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="prop in entry.propRows"
                      :key="`${entry.slug}-${prop.name}`"
                      class="border-t ui-border-strong"
                    >
                      <td class="whitespace-nowrap px-3 py-2 font-medium">
                        {{ prop.name }}
                      </td>
                      <td class="whitespace-nowrap px-3 py-2 ui-text-muted">
                        {{ prop.type }}
                      </td>
                      <td class="whitespace-nowrap px-3 py-2 ui-text-muted">
                        {{ prop.required ? 'Yes' : 'No' }}
                      </td>
                      <td class="px-3 py-2 ui-text-muted">
                        {{ prop.defaultValue }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>
