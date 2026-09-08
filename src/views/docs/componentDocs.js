const componentModuleLoaders = {
  ...import.meta.glob('../../components/**/*.vue'),
  ...import.meta.glob('../../layouts/*.vue')
}

const CATEGORY_META = {
  'Core UI': 'Foundational visual elements and primitives.',
  'Forms and Inputs': 'Data entry and selection controls.',
  'Feedback and Overlay': 'Status communication and overlays.',
  'Surface and Navigation': 'Navigation shells and container components.',
  'Data and Visualization': 'Tables, charts, and visualization utilities.',
  'Workflow and Layouts': 'Workflow utilities and full-page layout helpers.'
}

const exportedComponentNames = [
  'Avatar',
  'Badge',
  'Button',
  'Checkbox',
  'Divider',
  'Icon',
  'Image',
  'Input',
  'Label',
  'Link',
  'Logo',
  'Option',
  'CircularProgress',
  'Progress',
  'ProgressBar',
  'Radio',
  'Select',
  'Spinner',
  'Switch',
  'Text',
  'Textarea',
  'Tooltip',
  'Typography',
  'ThemeConfigurator',
  'Loader',
  'Alert',
  'Breadcrumb',
  'ButtonGroup',
  'Card',
  'CardHeader',
  'CardBody',
  'CardFooter',
  'CardContent',
  'CardTitle',
  'DatePicker',
  'Dropdown',
  'DropdownItem',
  'FileUpload',
  'FormField',
  'InputGroup',
  'ListItem',
  'MenuItem',
  'Modal',
  'ModalHeader',
  'ModalBody',
  'ModalFooter',
  'Notification',
  'Toast',
  'MultiSelect',
  'Search',
  'Slider',
  'Stepper',
  'StepperItem',
  'Tab',
  'TabPanel',
  'BarChart',
  'LineChart',
  'StackedBarChart',
  'GraphFilters',
  'Accordion',
  'AccordionItem',
  'Graph',
  'Calendar',
  'EventsCalendar',
  'DataTable',
  'DataTableHeader',
  'DataTableRow',
  'DataTableCell',
  'DataTablePagination',
  'DataTableFilters',
  'DataTableToolBar',
  'Footer',
  'Header',
  'ReusableFormModal',
  'ReusableForm',
  'Sidebar',
  'Timeline',
  'TimelineItem',
  'AuthLayout',
  'DefaultLayout',
  'ErrorLayout',
  'DashboardWidget',
  'ReminderConfig'
]

const formsAndInputs = new Set([
  'Input',
  'Textarea',
  'Select',
  'Checkbox',
  'Radio',
  'Switch',
  'DatePicker',
  'Slider',
  'FileUpload',
  'Search',
  'MultiSelect',
  'FormField',
  'InputGroup',
  'Option',
  'ReusableForm',
  'ReusableFormModal',
  'ReminderConfig'
])

const feedbackAndOverlay = new Set([
  'Alert',
  'Notification',
  'Toast',
  'Loader',
  'Spinner',
  'Progress',
  'ProgressBar',
  'CircularProgress',
  'Tooltip',
  'Modal',
  'ModalHeader',
  'ModalBody',
  'ModalFooter'
])

const surfaceAndNavigation = new Set([
  'Breadcrumb',
  'ButtonGroup',
  'Card',
  'CardHeader',
  'CardBody',
  'CardFooter',
  'CardContent',
  'CardTitle',
  'Dropdown',
  'DropdownItem',
  'ListItem',
  'MenuItem',
  'Sidebar',
  'Header',
  'Footer',
  'Tab',
  'TabPanel',
  'Accordion',
  'AccordionItem',
  'Timeline',
  'TimelineItem',
  'Link',
  'Logo',
  'Text',
  'Typography',
  'ThemeConfigurator',
  'Label',
  'Image',
  'Icon'
])

const dataAndVisualization = new Set([
  'DataTable',
  'DataTableHeader',
  'DataTableRow',
  'DataTableCell',
  'DataTablePagination',
  'DataTableFilters',
  'DataTableToolBar',
  'Calendar',
  'EventsCalendar',
  'Graph',
  'GraphFilters',
  'BarChart',
  'LineChart',
  'StackedBarChart',
  'DashboardWidget'
])

const workflowAndLayouts = new Set([
  'Stepper',
  'StepperItem',
  'AuthLayout',
  'DefaultLayout',
  'ErrorLayout'
])

const usageOverrides = {
  Toast: 'toast.success("Saved successfully")',
  Tooltip: '<Button v-tooltip="\'Helpful hint\'">Hover me</Button>',
  Button: '<Button permission="users.update" unauthorized="hide">Save</Button>',
  Input: '<Input v-model="value" placeholder="Type here" />',
  Select: '<Select v-model="plan" :options="planOptions" />',
  Checkbox: '<Checkbox v-model="enabled" label="Enable notifications" />',
  DataTable: '<DataTable :data="rows" :columns="columns" />',
  Modal: '<Modal :show="isOpen" @close="isOpen = false">...</Modal>'
}

const categoryOrder = [
  'Core UI',
  'Forms and Inputs',
  'Feedback and Overlay',
  'Surface and Navigation',
  'Data and Visualization',
  'Workflow and Layouts'
]

const moduleByName = Object.entries(componentModuleLoaders).reduce((accumulator, [modulePath, loader]) => {
  const fileName = modulePath.split('/').pop() || ''
  const componentName = fileName.replace('.vue', '')
  accumulator[componentName] = {
    modulePath,
    loader
  }
  return accumulator
}, {})

const toKebabCase = (value) => {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

const getCategoryForComponent = (name) => {
  if (formsAndInputs.has(name)) return 'Forms and Inputs'
  if (feedbackAndOverlay.has(name)) return 'Feedback and Overlay'
  if (surfaceAndNavigation.has(name)) return 'Surface and Navigation'
  if (dataAndVisualization.has(name)) return 'Data and Visualization'
  if (workflowAndLayouts.has(name)) return 'Workflow and Layouts'
  return 'Core UI'
}

const componentDocs = exportedComponentNames.map((name) => {
  const moduleMeta = moduleByName[name]
  const category = getCategoryForComponent(name)

  return {
    name,
    slug: toKebabCase(name),
    category,
    description: `${name} component for ${category.toLowerCase()}.`,
    importSnippet: `import { ${name} } from '@gspa/ui'`,
    usageSnippet: usageOverrides[name] || `<${name} />`,
    sourcePath: moduleMeta ? moduleMeta.modulePath.replace('../../', 'src/') : null,
    loader: moduleMeta ? moduleMeta.loader : null
  }
})

const componentBySlug = componentDocs.reduce((accumulator, component) => {
  accumulator[component.slug] = component
  return accumulator
}, {})

export { CATEGORY_META, categoryOrder }

export const getComponentDocs = () => componentDocs

export const getComponentGroups = (search = '') => {
  const normalized = search.trim().toLowerCase()

  return categoryOrder
    .map((category) => {
      const items = componentDocs
        .filter((component) => component.category === category)
        .filter((component) => !normalized || component.name.toLowerCase().includes(normalized))

      return {
        title: category,
        description: CATEGORY_META[category],
        items
      }
    })
    .filter((group) => group.items.length > 0)
}

export const getComponentDocBySlug = (slug) => {
  return componentBySlug[slug] || null
}

export const loadComponentBySlug = async (slug) => {
  const component = getComponentDocBySlug(slug)
  if (!component || !component.loader) return null

  const module = await component.loader()
  return module.default || module
}
