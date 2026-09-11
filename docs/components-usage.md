# Component Usage Documentation

This document provides comprehensive usage examples and API reference for all Vue components in GSPA UI.

## How Interactive Docs Render Real Components

The docs playground pages render the actual component modules from this repository, not static mock widgets.

### Runtime flow

1. `src/views/docs/componentDocs.js` creates lazy loaders using `import.meta.glob('../../components/**/*.vue')`.
2. The route `/components/components/:componentSlug` picks the requested component by slug.
3. `src/views/docs/pages/ComponentDetailPage.vue` loads the module for that slug at runtime.
4. Vue mounts it using dynamic rendering:

```vue
<component :is="loadedComponent" v-bind="playgroundBindings" />
```

5. Playground controls mutate `playgroundValues`, and those values are passed as live props.
6. The props table is generated from each component's runtime `props` definition.

### JSON fields in playground controls

When a prop is `Array` or `Object`, the playground expects strict JSON (quoted keys and string values), not JavaScript object syntax.

Invalid:

```js
[{ name: 'email' }]
```

Valid:

```json
[{"name":"email"}]
```

## Styling Conventions

Use **base classes** for static color decisions and **token utilities** for interactive states.

Base classes (static):

- `ui-surface`, `ui-surface-muted`, `ui-bg`, `--ui-bg`
- `ui-panel`
- `ui-text`, `ui-text-muted`, `ui-text-soft`, `ui-text`
- `ui-border`, `ui-border-strong`, `ui-border-surface`
- `ui-primary`, `ui-primary-bg`, `ui-primary-soft`
- `ui-accent`, `ui-accent-bg`, `ui-accent-soft`
- `ui-success`, `ui-success-bg`, `ui-success-soft`
- `ui-warning`, `ui-warning-bg`, `ui-warning-soft`
- `ui-danger`, `ui-danger-bg`, `ui-danger-soft`

Token utilities (interactive states only):

- `hover:bg-(--ui-primary-strong)`
- `focus:ring-(--ui-primary)`
- `focus:border-(--ui-primary)`
- `disabled:bg-(--ui-surface)`

Example:

```vue
<button
  class="ui-primary-bg ui-border rounded-md px-4 py-2 font-medium hover:bg-(--ui-primary-strong) focus:ring-2 focus:ring-(--ui-primary)"
>
  Action
</button>
```

## Table of Contents

- [Accordion](#accordion)
- [AccordionItem](#accordionitem)
- [Alert](#alert)
- [Avatar](#avatar)
- [Badge](#badge)
- [Breadcrumb](#breadcrumb)
- [Button](#button)
- [ButtonGroup](#buttongroup)
- [Calendar](#calendar)
- [Card](#card)
- [CardBody](#cardbody)
- [CardContent](#cardcontent)
- [CardFooter](#cardfooter)
- [CardHeader](#cardheader)
- [CardTitle](#cardtitle)
- [Checkbox](#checkbox)
- [DataTable](#datatable)
- [DatePicker](#datepicker)
- [Divider](#divider)
- [Dropdown](#dropdown)
- [DropdownItem](#dropdownitem)
- [FormField](#formfield)
- [Icon](#icon)
- [Image](#image)
- [Input](#input)
- [Label](#label)
- [Modal](#modal)
- [Progress](#progress)
- [Radio](#radio)
- [ReusableFormModal](#reusableformmodal)
- [Select](#select)
- [Slider](#slider)
- [Spinner](#spinner)
- [Switch](#switch)
- [Textarea](#textarea)

## Accordion

An expandable/collapsible component for organizing content into sections.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array` | - | Array of accordion items with title and content |
| `modelValue` | `Number \| Array` | `null` | Currently expanded item(s) index(es) |
| `multiple` | `Boolean` | `false` | Allow multiple items to be expanded |
| `variant` | `String` | `'default'` | Visual style (default, bordered, filled, flush) |
| `size` | `String` | `'md'` | Size variant (sm, md, lg) |
| `disabled` | `Boolean` | `false` | Whether the accordion is disabled |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Number \| Array` | Emitted when expanded items change |
| `change` | `{ index, expanded }` | Emitted when an item is toggled |

### Slots

| Slot | Description |
|------|-------------|
| `header-{index}` | Custom header content for specific item |
| `content-{index}` | Custom content for specific item |
| `content` | Fallback content slot |

### Example

```vue
<template>
  <Accordion
    v-model="expandedItems"
    :items="accordionItems"
    variant="bordered"
    size="lg"
    multiple
  />
</template>

<script setup>
import { ref } from 'vue'
import Accordion from '@/components/Accordion.vue'

const expandedItems = ref([0])
const accordionItems = [
  {
    id: 'item1',
    title: 'What is Vue?',
    content: 'Vue is a progressive JavaScript framework for building user interfaces.'
  },
  {
    id: 'item2',
    title: 'Why use Vue?',
    content: 'Vue offers a gentle learning curve, excellent performance, and great ecosystem.'
  }
]
</script>
```

## AccordionItem

A single expandable item for use within an accordion structure.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `String` | `'default'` | Visual style (default, bordered, filled, flush) |
| `size` | `String` | `'md'` | Size variant (sm, md, lg) |

### Slots

| Slot | Description |
|------|-------------|
| `header` | Header content |
| `content` | Content to show when expanded |

### Example

```vue
<template>
  <AccordionItem variant="bordered">
    <template #header>
      <h3>Custom Header</h3>
    </template>
    <template #content>
      <p>This is the content that expands.</p>
    </template>
  </AccordionItem>
</template>

<script setup>
import AccordionItem from '@/components/AccordionItem.vue'
</script>
```

## Avatar

A component for displaying user avatars with image, initials, or icon fallback.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `String` | - | Image source URL |
| `alt` | `String` | - | Alt text for image |
| `initials` | `String` | - | User initials to display |
| `size` | `String` | `'md'` | Size variant (xs, sm, md, lg, xl) |
| `variant` | `String` | `'default'` | Visual style (default, outline) |

### Example

```vue
<template>
  <div class="flex space-x-4">
    <Avatar src="/path/to/avatar.jpg" alt="User Avatar" />
    <Avatar initials="JD" size="lg" />
    <Avatar variant="outline" />
  </div>
</template>

<script setup>
import Avatar from '@/components/Avatar.vue'
</script>
```

## Breadcrumb

A navigation component showing the current page's location in a hierarchy.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array` | - | Array of breadcrumb items with label and optional href |
| `separator` | `String` | `'chevron-right'` | Icon name for separator |
| `ariaLabel` | `String` | `'Breadcrumb navigation'` | Accessibility label |
| `variant` | `String` | `'default'` | Visual style (default, ghost) |

### Example

```vue
<template>
  <Breadcrumb :items="breadcrumbItems" />
</template>

<script setup>
import Breadcrumb from '@/components/Breadcrumb.vue'

const breadcrumbItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Electronics' }
]
</script>
```

## ButtonGroup

A container component for grouping related buttons together.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `String` | `'horizontal'` | Layout direction (horizontal, vertical) |
| `size` | `String` | `'default'` | Size variant (sm, default, lg) |
| `variant` | `String` | `'default'` | Visual style (default, outline, ghost) |
| `ariaLabel` | `String` | - | Accessibility label for the group |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Button components |

### Example

```vue
<template>
  <ButtonGroup variant="outline" aria-label="Text formatting">
    <Button>Bold</Button>
    <Button>Italic</Button>
    <Button>Underline</Button>
  </ButtonGroup>
</template>

<script setup>
import ButtonGroup from '@/components/ButtonGroup.vue'
import Button from '@/components/Button.vue'
</script>
```

## Calendar

A standalone calendar component for date selection with month navigation.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | - | Custom ID |
| `modelValue` | `String \| Date` | - | Selected date |
| `disabled` | `Boolean` | `false` | Whether disabled |
| `required` | `Boolean` | `false` | Whether required |
| `min` | `String \| Date` | - | Minimum selectable date |
| `max` | `String \| Date` | - | Maximum selectable date |
| `placeholder` | `String` | `'Select date'` | Placeholder text |
| `format` | `String` | `'MM/DD/YYYY'` | Date format |
| `clearable` | `Boolean` | `true` | Show clear button |
| `showToday` | `Boolean` | `true` | Show today button |
| `calendarPosition` | `String` | `'left-0'` | Calendar dropdown position |
| `ariaDescribedby` | `String` | - | ARIA describedby attribute |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `String` | Emitted when date changes |

### Example

```vue
<template>
  <Calendar
    v-model="selectedDate"
    placeholder="Pick a date"
    format="YYYY-MM-DD"
    :min="'2023-01-01'"
    :max="'2023-12-31'"
  />
</template>

<script setup>
import { ref } from 'vue'
import Calendar from '@/components/Calendar.vue'

const selectedDate = ref('')
</script>
```

## Divider

A visual separator component for dividing content sections.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `String` | `'horizontal'` | Orientation (horizontal, vertical) |
| `size` | `String` | `'md'` | Size variant (sm, md, lg) |
| `color` | `String` | `'gray'` | Color variant (gray, primary, secondary) |
| `faded` | `Boolean` | `false` | Whether to apply opacity |
| `label` | `String` | - | Label text for horizontal dividers |
| `spacing` | `String` | - | Custom spacing classes |

### Example

```vue
<template>
  <div>
    <p>Content above</p>
    <Divider />
    <p>Content below</p>

    <Divider orientation="vertical" class="h-6" />

    <Divider label="Section Break" />
  </div>
</template>

<script setup>
import Divider from '@/components/Divider.vue'
</script>
```

## Dropdown

A dropdown menu component with customizable trigger and placement.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `triggerText` | `String` | `'Options'` | Text for default trigger |
| `placement` | `String` | `'bottom-start'` | Dropdown position (bottom-start, bottom-end, top-start, top-end) |
| `variant` | `String` | `'default'` | Trigger button variant (default, outline, ghost) |

### Slots

| Slot | Description |
|------|-------------|
| `trigger` | Custom trigger content |
| `default` | Dropdown menu items |

### Example

```vue
<template>
  <Dropdown>
    <template #trigger>
      <Button variant="outline">Menu</Button>
    </template>
    <DropdownItem @click="action1">Action 1</DropdownItem>
    <DropdownItem @click="action2">Action 2</DropdownItem>
    <DropdownItem variant="danger" @click="delete">Delete</DropdownItem>
  </Dropdown>
</template>

<script setup>
import Dropdown from '@/components/Dropdown.vue'
import DropdownItem from '@/components/DropdownItem.vue'
import Button from '@/components/Button.vue'

const action1 = () => console.log('Action 1')
const action2 = () => console.log('Action 2')
const delete = () => console.log('Delete')
</script>
```

## DropdownItem

An individual item within a dropdown menu.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `String` | - | Link URL (makes item a link) |
| `icon` | `String` | - | Icon name |
| `shortcut` | `String` | - | Keyboard shortcut text |
| `disabled` | `Boolean` | `false` | Whether disabled |
| `variant` | `String` | `'default'` | Visual variant (default, danger) |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `Event` | Emitted when item is clicked |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Item content |

### Example

```vue
<template>
  <DropdownItem icon="user" shortcut="⌘U" @click="profile">
    Profile
  </DropdownItem>
</template>

<script setup>
import DropdownItem from '@/components/DropdownItem.vue'

const profile = () => console.log('Open profile')
</script>
```

## Image

An enhanced image component with loading states, aspect ratios, and error handling.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `String` | - | Image source URL |
| `alt` | `String` | `''` | Alt text |
| `aspectRatio` | `String` | `'auto'` | Aspect ratio (auto, square, 16/9, 4/3, 3/2) |
| `objectFit` | `String` | `'cover'` | Object fit (cover, contain, fill, none, scale-down) |
| `loading` | `String` | `'lazy'` | Loading strategy (lazy, eager) |
| `showSpinner` | `Boolean` | `true` | Show loading spinner |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `load` | `Event` | Emitted when image loads |
| `error` | `Event` | Emitted when image fails to load |

### Example

```vue
<template>
  <div class="grid grid-cols-3 gap-4">
    <Image
      src="/path/to/image1.jpg"
      alt="Image 1"
      aspect-ratio="square"
    />
    <Image
      src="/path/to/image2.jpg"
      alt="Image 2"
      aspect-ratio="16/9"
      object-fit="contain"
    />
  </div>
</template>

<script setup>
import Image from '@/components/Image.vue'
</script>
```

## Slider

A customizable range slider component for selecting numeric values.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Number \| String` | `0` | The current value of the slider |
| `min` | `Number` | `0` | Minimum value |
| `max` | `Number` | `100` | Maximum value |
| `step` | `Number` | `1` | Step increment |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Number` | Emitted when the slider value changes |

### Example

```vue
<template>
  <Slider v-model="volume" :min="0" :max="100" :step="5" />
</template>

<script setup>
import { ref } from 'vue'
import Slider from '@/components/Slider.vue'

const volume = ref(50)
</script>
```

## Input

A versatile input component supporting various types and features.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `String \| Number` | `''` | The input value |
| `type` | `String` | `'text'` | Input type (text, email, password, number, tel, url, search, date, color) |
| `placeholder` | `String` | `''` | Placeholder text |
| `disabled` | `Boolean` | `false` | Whether the input is disabled |
| `readonly` | `Boolean` | `false` | Whether the input is readonly |
| `required` | `Boolean` | `false` | Whether the input is required |
| `size` | `String` | `'md'` | Size variant (sm, md, lg) |
| `variant` | `String` | `'default'` | Visual variant (default, error, success) |
| `iconLeft` | `String \| Object` | `null` | Icon component for left side |
| `iconRight` | `String \| Object` | `null` | Icon component for right side |
| `clearable` | `Boolean` | `false` | Show clear button when input has value |
| `clearLabel` | `String` | `'Clear input'` | Accessibility label for clear button |
| `autocomplete` | `String` | `null` | Autocomplete attribute |
| `error` | `String` | `null` | Error message |
| `id` | `String` | `null` | Custom ID for the input |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `String \| Number` | Emitted when input value changes |
| `blur` | `Event` | Emitted on blur |
| `focus` | `Event` | Emitted on focus |
| `clear` | - | Emitted when clear button is clicked |
| `keydown` | `Event` | Emitted on keydown |

### Exposed Methods

- `focus()`: Focus the input
- `blur()`: Blur the input
- `select()`: Select all text in the input

### Example

```vue
<template>
  <Input
    v-model="email"
    type="email"
    placeholder="Enter your email"
    :iconLeft="MailIcon"
    clearable
    required
  />
</template>

<script setup>
import { ref } from 'vue'
import Input from '@/components/Input.vue'
import MailIcon from '@/components/icons/MailIcon.vue'

const email = ref('')
</script>
```

## DatePicker

A date picker component with calendar dropdown.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | - | Custom ID |
| `modelValue` | `String \| Date` | - | Selected date |
| `disabled` | `Boolean` | `false` | Whether disabled |
| `required` | `Boolean` | `false` | Whether required |
| `min` | `String \| Date` | - | Minimum selectable date |
| `max` | `String \| Date` | - | Maximum selectable date |
| `minDate` | `String \| Date` | - | Minimum selectable date (takes precedence over `min`) |
| `maxDate` | `String \| Date` | - | Maximum selectable date (takes precedence over `max`) |
| `yearRange` | `readonly [number, number]` | - | Inclusive years shown and selectable |
| `initialView` | `'day' \| 'month' \| 'year'` | `'day'` | View displayed whenever the calendar opens |
| `placeholder` | `String` | `'Select date'` | Placeholder text |
| `format` | `String` | `'DD/MM/YYYY'` | Date format |
| `clearable` | `Boolean` | `true` | Show clear button |
| `showToday` | `Boolean` | `true` | Show today button in calendar |
| `calendarPosition` | `String` | `'left-0 bottom-full'` | Calendar dropdown position |
| `ariaDescribedby` | `String` | - | ARIA describedby attribute |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `String` | Emitted when date changes |

### Example

```vue
<template>
  <DatePicker
    v-model="selectedDate"
    placeholder="Choose a date"
    format="YYYY-MM-DD"
    :min="minDate"
    :max="maxDate"
  />
</template>

<script setup>
import { ref } from 'vue'
import DatePicker from '@/components/DatePicker.vue'

const selectedDate = ref('')
const minDate = '2023-01-01'
const maxDate = '2023-12-31'
</script>
```

For dates of birth, start with years while preserving the API date format:

```vue
<DatePicker
  v-model="dateOfBirth"
  initial-view="year"
  :year-range="[1900, currentYear]"
  :max-date="yesterday"
  format="YYYY-MM-DD"
/>
```

## ReusableFormModal

A reusable modal component for creating and editing forms with various field types.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Boolean` | `false` | Modal visibility |
| `modalType` | `String` | - | 'create' or 'edit' |
| `entityName` | `String` | - | Name of the entity being created/edited |
| `fields` | `Array` | - | Array of field configurations |
| `initialData` | `Object` | `null` | Initial form data for editing |
| `loading` | `Boolean` | `false` | Loading state |
| `customValidation` | `Function` | `null` | Custom validation function |
| `modalSize` | `String` | `'4xl'` | Modal size |
| `modalResizable` | `Boolean` | `false` | Whether modal is resizable |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Boolean` | Modal visibility changes |
| `submit` | `{ formData, modalType, originalData }` | Form submission |
| `close` | - | Modal close |

### Field Configuration

Each field in the `fields` array should have:

```javascript
{
  name: 'fieldName', // Required
  label: 'Field Label', // Required
  type: 'text', // Required: text, number, password, textarea, select, checkbox, slider, date, color
  placeholder: 'Placeholder',
  required: false,
  disabled: false,
  min: 0, // For number/slider/date
  max: 100, // For number/slider/date
  step: 1, // For slider
  rows: 3, // For textarea
  options: [{ value: '1', label: 'Option 1' }], // For select
  checkboxLabel: 'Check this', // For checkbox
  format: 'MM/DD/YYYY', // For date
  clearable: true, // For date
  showToday: true, // For date
  calendarPosition: 'left-0 bottom-full', // For date
  validate: (value, formData) => errorMessage || null, // Custom validation
  onChange: (value, formData) => {}, // Change handler
  trailingIcon: 'eye', // Optional right-side inline icon (input-like fields)
  trailingIconTitle: 'Show password', // Optional tooltip/title for trailing icon
  trailingIconAriaLabel: 'Show password', // Optional aria-label for accessibility
  onTrailingIconClick: (formData, field) => {}, // Optional click handler for trailing icon
  errorMessage: 'Custom error message',
  helpText: 'Short helper text shown under the field'
}
```

### Example

```vue
<template>
  <ReusableFormModal
    v-model="showModal"
    :modalType="modalType"
    entityName="User"
    :fields="userFields"
    :initialData="editingUser"
    :loading="submitting"
    @submit="handleSubmit"
  />
</template>

<script setup>
import { ref } from 'vue'
import ReusableFormModal from '@/components/ReusableFormModal.vue'

const showModal = ref(false)
const modalType = ref('create')
const editingUser = ref(null)
const submitting = ref(false)

const userFields = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    required: true
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true
  },
  {
    name: 'age',
    label: 'Age',
    type: 'number',
    min: 18,
    max: 100
  },
  {
    name: 'bio',
    label: 'Biography',
    type: 'textarea',
    rows: 4
  },
  {
    name: 'department',
    label: 'Department',
    type: 'select',
    options: [
      { value: 'engineering', label: 'Engineering' },
      { value: 'design', label: 'Design' },
      { value: 'marketing', label: 'Marketing' }
    ]
  },
  {
    name: 'isActive',
    label: 'Active',
    type: 'checkbox',
    checkboxLabel: 'User is active'
  },
  {
    name: 'rating',
    label: 'Rating',
    type: 'slider',
    min: 1,
    max: 5,
    step: 1
  },
  {
    name: 'birthDate',
    label: 'Birth Date',
    type: 'date',
    format: 'YYYY-MM-DD'
  }
]

const handleSubmit = ({ formData, modalType }) => {
  submitting.value = true
  // Handle form submission
  console.log('Submitted:', formData, modalType)
  submitting.value = false
  showModal.value = false
}
</script>
```

## Button

A versatile button component with multiple variants, sizes, and states.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `String` | `'default'` | Visual style (default, danger, outline, secondary, ghost, link, success, warning, info, subtle, dark, light, primaryOutline, dangerOutline, successOutline, gradient) |
| `size` | `String` | `'default'` | Size variant (default, xs, sm, lg, icon) |
| `disabled` | `Boolean` | `false` | Whether the button is disabled |
| `loading` | `Boolean` | `false` | Shows loading spinner |
| `loadingText` | `String` | `null` | Text to show when loading |

### Slots

| Slot | Description |
|------|-------------|
| `icon` | Icon content (shown before text when not loading) |
| `default` | Button text content |

### Example

```vue
<template>
  <div class="space-x-2">
    <Button variant="default">Default</Button>
    <Button variant="outline" size="sm">Outline</Button>
    <Button variant="danger" :loading="true" loadingText="Deleting...">
      Delete
    </Button>
    <Button variant="icon" size="icon">
      <template #icon>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </template>
    </Button>
  </div>
</template>

<script setup>
import Button from '@/components/Button.vue'
</script>
```

## Alert

A notification component for displaying messages with different variants and optional actions.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `String` | `'info'` | Alert style (info, success, warning, error, default, danger) |
| `title` | `String` | - | Alert title |
| `message` | `String` | - | Alert message |
| `dismissible` | `Boolean` | `false` | Show dismiss button |
| `dismissLabel` | `String` | `'Dismiss alert'` | Accessibility label for dismiss button |
| `showIcon` | `Boolean` | `true` | Show variant icon |
| `actions` | `Array` | `[]` | Array of action buttons |
| `autoClose` | `Boolean \| Number` | `false` | Auto-dismiss after delay (ms) or false |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `dismiss` | - | Emitted when alert is dismissed |
| `action` | `action` | Emitted when an action button is clicked |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Alert content (replaces message) |
| `actions` | Custom action buttons |

### Example

```vue
<template>
  <div class="space-y-4">
    <Alert variant="success" title="Success!" message="Your changes have been saved." dismissible />

    <Alert variant="warning" title="Warning" :autoClose="5000">
      This action cannot be undone.
      <template #actions>
        <Button variant="outline" size="sm" @click="confirmAction">Confirm</Button>
      </template>
    </Alert>

    <Alert variant="error" title="Error" dismissible>
      <p>Something went wrong. Please try again.</p>
    </Alert>
  </div>
</template>

<script setup>
import Alert from '@/components/Alert.vue'
import Button from '@/components/Button.vue'

const confirmAction = () => {
  console.log('Action confirmed')
}
</script>
```

## Badge

A small label component for displaying status, tags, or counts with multiple variant options.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `String` | `'default'` | Visual style (default, secondary, danger, primary, outline, success, warning, info, ghost, link, subtle, dark, light, primaryOutline, dangerOutline, successOutline, gradient) |
| `size` | `String` | `'md'` | Size variant (sm, md, lg) |
| `shape` | `String` | `'rounded'` | Shape variant (rounded, pill, square) |
| `icon` | `String \| Object` | `null` | Icon component |
| `dismissible` | `Boolean` | `false` | Show dismiss button |
| `dismissLabel` | `String` | `'Dismiss'` | Accessibility label for dismiss button |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `dismiss` | - | Emitted when badge is dismissed |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Badge content |

### Example

```vue
<template>
  <div class="space-x-2">
    <Badge variant="default">New</Badge>
    <Badge variant="primary">Primary</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="success" size="sm">Active</Badge>
    <Badge variant="warning" shape="pill">Pending</Badge>
    <Badge variant="danger" icon="ExclamationIcon">Error</Badge>
    <Badge variant="info">Info</Badge>
    <Badge variant="ghost">Ghost</Badge>
    <Badge variant="link">Link</Badge>
    <Badge variant="subtle">Subtle</Badge>
    <Badge variant="dark">Dark</Badge>
    <Badge variant="light">Light</Badge>
    <Badge variant="primaryOutline">Primary Outline</Badge>
    <Badge variant="dangerOutline">danger Outline</Badge>
    <Badge variant="successOutline">Success Outline</Badge>
    <Badge variant="gradient">Gradient</Badge>
    <Badge variant="outline" dismissible @dismiss="handleDismiss">
      Dismissible
    </Badge>
  </div>
</template>

<script setup>
import Badge from '@/components/Badge.vue'

const handleDismiss = () => {
  console.log('Badge dismissed')
}
</script>
```

## Card

A container component for grouping related content with optional header, image, and footer.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `String` | `'default'` | Visual style (default, outlined, elevated, filled) |
| `padding` | `String` | `'md'` | Padding size (none, sm, md, lg, xl) |
| `title` | `String` | - | Card title |
| `subtitle` | `String` | - | Card subtitle |
| `image` | `String` | - | Image source URL |
| `imageAlt` | `String` | `'Card image'` | Image alt text |
| `hoverable` | `Boolean` | `false` | Add hover effect |
| `clickable` | `Boolean` | `false` | Make card clickable |
| `loading` | `Boolean` | `false` | Loading state |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `Event` | Emitted when card is clicked (if clickable) |

### Slots

| Slot | Description |
|------|-------------|
| `header` | Card header content |
| `image` | Card image |
| `default` | Card content |
| `footer` | Card footer |
| `actions` | Header actions |

### Example

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Card
      title="Card Title"
      subtitle="Card subtitle"
      image="/path/to/image.jpg"
      hoverable
      clickable
      @click="handleCardClick"
    >
      <p>This is the card content.</p>

      <template #footer>
        <Button variant="outline" size="sm">Learn More</Button>
      </template>
    </Card>

    <Card variant="elevated" padding="lg">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">Custom Header</h3>
          <div class="space-x-2">
            <Button variant="ghost" size="sm">Edit</Button>
            <Button variant="ghost" size="sm">Delete</Button>
          </div>
        </div>
      </template>

      <p>Card with custom header and actions.</p>
    </Card>
  </div>
</template>

<script setup>
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'

const handleCardClick = () => {
  console.log('Card clicked')
}
</script>
```

## CardBody

A container component for card content with configurable padding.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `String` | `'default'` | Padding variant (default, compact, spacious) |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Card body content |

### Example

```vue
<template>
  <Card>
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
    </CardHeader>
    <CardBody>
      <p>This is the main content of the card.</p>
    </CardBody>
    <CardFooter>
      <Button>Action</Button>
    </CardFooter>
  </Card>
</template>

<script setup>
import Card from '@/components/Card.vue'
import CardHeader from '@/components/CardHeader.vue'
import CardTitle from '@/components/CardTitle.vue'
import CardBody from '@/components/CardBody.vue'
import CardFooter from '@/components/CardFooter.vue'
import Button from '@/components/Button.vue'
</script>
```

## CardContent

A container component for card content with reduced top padding.

### Slots

| Slot | Description |
|------|-------------|
| `default` | Card content |

### Example

```vue
<template>
  <Card>
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
    </CardHeader>
    <CardContent>
      <p>This content has reduced top padding.</p>
    </CardContent>
  </Card>
</template>

<script setup>
import Card from '@/components/Card.vue'
import CardHeader from '@/components/CardHeader.vue'
import CardTitle from '@/components/CardTitle.vue'
import CardContent from '@/components/CardContent.vue'
</script>
```

## CardFooter

A container component for card footer content.

### Slots

| Slot | Description |
|------|-------------|
| `default` | Card footer content |

### Example

```vue
<template>
  <Card>
    <CardBody>
      <p>Card content</p>
    </CardBody>
    <CardFooter>
      <div class="flex justify-end space-x-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </div>
    </CardFooter>
  </Card>
</template>

<script setup>
import Card from '@/components/Card.vue'
import CardBody from '@/components/CardBody.vue'
import CardFooter from '@/components/CardFooter.vue'
import Button from '@/components/Button.vue'
</script>
```

## CardHeader

A container component for card header content.

### Slots

| Slot | Description |
|------|-------------|
| `default` | Card header content |

### Example

```vue
<template>
  <Card>
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
      <p class="text-sm text-muted-foreground">Card subtitle</p>
    </CardHeader>
    <CardBody>
      <p>Card content</p>
    </CardBody>
  </Card>
</template>

<script setup>
import Card from '@/components/Card.vue'
import CardHeader from '@/components/CardHeader.vue'
import CardTitle from '@/components/CardTitle.vue'
import CardBody from '@/components/CardBody.vue'
</script>
```

## CardTitle

A styled title component for card headers.

### Slots

| Slot | Description |
|------|-------------|
| `default` | Title content |

### Example

```vue
<template>
  <Card>
    <CardHeader>
      <CardTitle>Important Announcement</CardTitle>
    </CardHeader>
    <CardBody>
      <p>This is an important message.</p>
    </CardBody>
  </Card>
</template>

<script setup>
import Card from '@/components/Card.vue'
import CardHeader from '@/components/CardHeader.vue'
import CardTitle from '@/components/CardTitle.vue'
import CardBody from '@/components/CardBody.vue'
</script>
```

## Checkbox

A customizable checkbox component with label and description support.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Boolean \| Array` | `false` | Checkbox value or array of values |
| `value` | `String \| Number \| Boolean` | `null` | Value when used in checkbox group |
| `label` | `String` | `null` | Checkbox label |
| `description` | `String` | `null` | Additional description text |
| `disabled` | `Boolean` | `false` | Whether disabled |
| `required` | `Boolean` | `false` | Whether required |
| `indeterminate` | `Boolean` | `false` | Indeterminate state |
| `size` | `String` | `'md'` | Size variant (sm, md, lg) |
| `variant` | `String` | `'default'` | Visual variant (default, error) |
| `id` | `String` | `null` | Custom ID |
| `error` | `String` | `null` | Error message |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Boolean \| Array` | Emitted when value changes |
| `change` | `Boolean` | Emitted on change |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Label content (replaces label prop) |

### Example

```vue
<template>
  <div class="space-y-4">
    <!-- Single checkbox -->
    <Checkbox v-model="agree" label="I agree to the terms" required />

    <!-- Checkbox with description -->
    <Checkbox
      v-model="newsletter"
      label="Subscribe to newsletter"
      description="Receive weekly updates about our products"
    />

    <!-- Checkbox group -->
    <div>
      <h4 class="font-medium mb-2">Select your interests:</h4>
      <div class="space-y-2">
        <Checkbox
          v-model="interests"
          value="tech"
          label="Technology"
        />
        <Checkbox
          v-model="interests"
          value="design"
          label="Design"
        />
        <Checkbox
          v-model="interests"
          value="business"
          label="Business"
        />
      </div>
    </div>

    <!-- Indeterminate checkbox -->
    <Checkbox
      v-model="selectAll"
      :indeterminate="partialSelection"
      label="Select all"
      @change="handleSelectAll"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Checkbox from '@/components/Checkbox.vue'

const agree = ref(false)
const newsletter = ref(true)
const interests = ref(['tech'])
const selectAll = ref(false)

const partialSelection = computed(() => {
  return interests.value.length > 0 && interests.value.length < 3
})

const handleSelectAll = (checked) => {
  if (checked) {
    interests.value = ['tech', 'design', 'business']
  } else {
    interests.value = []
  }
}
</script>
```

## DataTable

A comprehensive data table component with sorting, pagination, selection, and loading states.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Array` | - | Array of data items |
| `columns` | `Array` | - | Column configuration array |
| `title` | `String` | - | Table title |
| `description` | `String` | - | Table description |
| `selectable` | `Boolean` | `false` | Enable row selection |
| `selectedItems` | `Array` | `[]` | Currently selected items |
| `sortBy` | `String` | - | Initial sort column |
| `sortOrder` | `String` | `'asc'` | Initial sort order |
| `pageSize` | `Number` | `10` | Items per page |
| `showPagination` | `Boolean` | `true` | Show pagination |
| `striped` | `Boolean` | `false` | Striped rows |
| `hoverable` | `Boolean` | `true` | Hover effects |
| `clickableRows` | `Boolean` | `false` | Make rows clickable |
| `emptyText` | `String` | `'No data available'` | Empty state text |
| `rowKey` | `String` | `'id'` | Unique key for rows |
| `variant` | `String` | `'default'` | Table variant |
| `density` | `String` | `'normal'` | Row density |
| `loading` | `Boolean` | `false` | Loading state |
| `dataLoading` | `Boolean` | `false` | Data loading state |
| `sortLoading` | `Boolean` | `false` | Sort loading state |
| `bulkLoading` | `Boolean` | `false` | Bulk operation loading |
| `rowLoading` | `Object` | `{}` | Row-specific loading states |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `selection-change` | `selectedItems` | Selection changed |
| `sort-change` | `{ column, direction }` | Sort changed |
| `row-click` | `rowData` | Row clicked |
| `page-change` | `page` | Page changed |
| `page-size-change` | `size` | Page size changed |

### Slots

| Slot | Description |
|------|-------------|
| `header` | Table header content |
| `filters` | Filter controls |
| `cell-{columnKey}` | Custom cell content |
| `actions` | Row actions |
| `empty` | Empty state content |
| `footer` | Table footer |

### Example

```vue
<template>
  <DataTable
    :data="users"
    :columns="columns"
    title="Users"
    selectable
    :selected-items="selectedUsers"
    @selection-change="selectedUsers = $event"
    @row-click="handleRowClick"
  >
    <template #actions="{ item }">
      <Button variant="ghost" size="sm" @click="editUser(item)">Edit</Button>
      <Button variant="ghost" size="sm" @click="deleteUser(item)">Delete</Button>
    </template>
  </DataTable>
</template>

<script setup>
import { ref } from 'vue'
import DataTable from '@/components/DataTable.vue'
import Button from '@/components/Button.vue'

const selectedUsers = ref([])
const users = ref([
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' }
])

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role' }
]

const handleRowClick = (row) => {
  console.log('Row clicked:', row)
}

const editUser = (user) => {
  console.log('Edit user:', user)
}

const deleteUser = (user) => {
  console.log('Delete user:', user)
}
</script>
```

## Select

A styled select dropdown component.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `String \| Number \| Boolean` | `''` | Selected value |
| `id` | `String` | `null` | Custom ID |
| `name` | `String` | `null` | Form name |
| `disabled` | `Boolean` | `false` | Whether disabled |
| `required` | `Boolean` | `false` | Whether required |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `String \| Number \| Boolean` | Emitted when selection changes |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Option elements |

### Example

```vue
<template>
  <Select v-model="selectedOption">
    <option value="" disabled>Select an option</option>
    <option value="option1">Option 1</option>
    <option value="option2">Option 2</option>
    <option value="option3">Option 3</option>
  </Select>
</template>

<script setup>
import { ref } from 'vue'
import Select from '@/components/Select.vue'

const selectedOption = ref('')
</script>
```

## Textarea

A multi-line text input component with auto-resize and validation support.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `String` | `''` | Textarea value |
| `placeholder` | `String` | `''` | Placeholder text |
| `disabled` | `Boolean` | `false` | Whether disabled |
| `readonly` | `Boolean` | `false` | Whether readonly |
| `required` | `Boolean` | `false` | Whether required |
| `rows` | `Number` | `3` | Number of visible rows |
| `maxlength` | `Number` | `null` | Maximum character count |
| `resize` | `String` | `'vertical'` | Resize behavior (none, vertical, horizontal, both) |
| `autoResize` | `Boolean` | `false` | Auto-resize to content height |
| `size` | `String` | `'md'` | Size variant (sm, md, lg) |
| `variant` | `String` | `'default'` | Visual variant (default, error, success) |
| `error` | `String` | `null` | Error message |
| `id` | `String` | `null` | Custom ID |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `String` | Emitted when value changes |
| `blur` | `Event` | Emitted on blur |
| `focus` | `Event` | Emitted on focus |
| `keydown` | `Event` | Emitted on keydown |

### Exposed Methods

- `focus()`: Focus the textarea
- `blur()`: Blur the textarea
- `select()`: Select all text

### Example

```vue
<template>
  <Textarea
    v-model="message"
    placeholder="Enter your message..."
    :rows="4"
    :autoResize="true"
    maxlength="500"
    required
  />
</template>

<script setup>
import { ref } from 'vue'
import Textarea from '@/components/Textarea.vue'

const message = ref('')
</script>
```

## Modal

A modal dialog component with backdrop and keyboard support.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Boolean` | - | Modal visibility |
| `showClose` | `Boolean` | `true` | Show close button |
| `closeOnBackdrop` | `Boolean` | `true` | Close on backdrop click |
| `size` | `String` | `'4xl'` | Modal size (sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, full) |
| `resizable` | `Boolean` | `false` | Whether modal is resizable |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Boolean` | Modal visibility changes |
| `close` | - | Emitted when modal closes |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Modal content |

### Example

```vue
<template>
  <div>
    <Button @click="showModal = true">Open Modal</Button>

    <Modal v-model="showModal" size="lg">
      <div class="p-6">
        <h2 class="text-lg font-semibold mb-4">Modal Title</h2>
        <p class="mb-4">Modal content goes here.</p>
        <div class="flex justify-end">
          <Button @click="showModal = false">Close</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'

const showModal = ref(false)
</script>
```

## FormField

A form field wrapper component that provides labels, descriptions, and validation messages.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `String` | - | Field label |
| `description` | `String` | - | Field description |
| `error` | `String` | - | Error message |
| `success` | `String` | - | Success message |
| `helpText` | `String` | - | Help text |
| `required` | `Boolean` | `false` | Whether field is required |
| `type` | `String` | `'text'` | Field type (for password toggle) |
| `modelValue` | `String \| Date` | - | Field value |
| `size` | `String` | `'md'` | Size variant (sm, md, lg) |
| `id` | `String` | - | Custom ID |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `String \| Date` | Emitted when value changes |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Field input component |

### Scoped Slot Props

The default slot receives:

- `fieldId`: Unique ID for the field
- `hasError`: Boolean indicating if field has error
- `ariaDescribedBy`: ARIA describedby attribute
- `showPassword`: Boolean for password visibility (password fields only)
- `togglePasswordVisibility`: Function to toggle password visibility

### Example

```vue
<template>
  <FormField
    label="Email Address"
    description="We'll never share your email with anyone else."
    :error="emailError"
    required
  >
    <template #default="{ fieldId, hasError, ariaDescribedBy }">
      <Input
        :id="fieldId"
        v-model="email"
        type="email"
        placeholder="Enter your email"
        :class="hasError ? 'border-red-500' : ''"
        :aria-describedby="ariaDescribedBy"
      />
    </template>
  </FormField>
</template>

<script setup>
import { ref } from 'vue'
import FormField from '@/components/FormField.vue'
import Input from '@/components/Input.vue'

const email = ref('')
const emailError = ref('')
</script>
```

## Label

A styled label component for form inputs.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `htmlFor` | `String` | - | ID of associated input |
| `size` | `String` | `'md'` | Size variant (sm, md, lg) |
| `required` | `Boolean` | `false` | Show required indicator |
| `disabled` | `Boolean` | `false` | Whether associated input is disabled |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Label text |

### Example

```vue
<template>
  <div>
    <Label htmlFor="username" required>Username</Label>
    <Input id="username" v-model="username" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Label from '@/components/Label.vue'
import Input from '@/components/Input.vue'

const username = ref('')
</script>
```

## Radio

A radio button component for single selection in a group.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Any` | - | Selected value |
| `value` | `Any` | - | Value of this radio button |
| `label` | `String` | - | Radio button label |
| `disabled` | `Boolean` | `false` | Whether disabled |
| `size` | `String` | `'md'` | Size variant (sm, md, lg) |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Any` | Emitted when radio is selected |

### Example

```vue
<template>
  <div class="space-y-2">
    <Radio v-model="selected" value="option1" label="Option 1" />
    <Radio v-model="selected" value="option2" label="Option 2" />
    <Radio v-model="selected" value="option3" label="Option 3" />
  </div>
  <p>Selected: {{ selected }}</p>
</template>

<script setup>
import { ref } from 'vue'
import Radio from '@/components/Radio.vue'

const selected = ref('option1')
</script>
```

## Switch

A toggle switch component for boolean values.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Boolean` | - | Switch state |
| `disabled` | `Boolean` | `false` | Whether disabled |
| `size` | `String` | `'md'` | Size variant (sm, md, lg) |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Boolean` | Emitted when switch toggles |

### Example

```vue
<template>
  <div class="flex items-center space-x-2">
    <Switch v-model="enabled" />
    <Label>Enable feature</Label>
  </div>
  <p>Feature is {{ enabled ? 'enabled' : 'disabled' }}</p>
</template>

<script setup>
import { ref } from 'vue'
import Switch from '@/components/Switch.vue'
import Label from '@/components/Label.vue'

const enabled = ref(false)
</script>
```

## Progress

A progress bar component for showing completion status.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Number` | `0` | Current progress value |
| `max` | `Number` | `100` | Maximum value |
| `size` | `String` | `'default'` | Size variant (sm, default, md, lg) |
| `variant` | `String` | `'default'` | Color variant (default, success, warning, danger) |

### Example

```vue
<template>
  <div class="space-y-4">
    <Progress :value="progress" />
    <Progress :value="75" variant="success" size="sm" />
    <Progress :value="50" variant="warning" />
    <Progress :value="25" variant="danger" size="lg" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Progress from '@/components/Progress.vue'

const progress = ref(60)
</script>
```

## Spinner

A loading spinner component with various sizes and colors.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `String` | `'md'` | Size variant (xs, sm, md, lg, xl) |
| `variant` | `String` | `'default'` | Color variant (default, primary, secondary) |
| `label` | `String` | `'Loading...'` | Accessibility label |

### Example

```vue
<template>
  <div class="space-y-4">
    <Spinner />
    <Spinner size="lg" variant="primary" />
    <Spinner size="sm" variant="secondary" label="Saving..." />
  </div>
</template>

<script setup>
import Spinner from '@/components/Spinner.vue'
</script>
```

## Icon

A FontAwesome icon component with size and color options.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `String` | - | FontAwesome icon name |
| `prefix` | `String` | `'fas'` | FontAwesome prefix (fas, far, fab, etc.) |
| `size` | `String` | `'md'` | Size variant (xs, sm, md, lg, xl, xxl) |
| `color` | `String` | - | Text color class |
| `ariaLabel` | `String` | - | Accessibility label |

### Example

```vue
<template>
  <div class="space-x-4">
    <Icon icon="user" />
    <Icon icon="heart" prefix="far" color="red-500" />
    <Icon icon="github" prefix="fab" size="lg" ariaLabel="GitHub" />
  </div>
</template>

<script setup>
import Icon from '@/components/Icon.vue'
</script>
```

<!-- Additional components (DataTableCell, DataTableFilters, DataTableHeader, DataTablePagination, DataTableRow, DataTableToolBar, FileUpload, Footer, Header, InputGroup, Link, ListItem, Logo, MainNavigation, MenuItem, ModalBody, ModalFooter, ModalHeader, Notification, Option, ProgressBar, RiskModal, Search, Sidebar, Stepper, StepperItem, Loader, Tab, TabPanel, Text, Timeline, TimelineItem, Toast, Tooltip, Typography) follow the same pattern. For these components, refer to their source code for props, events, and slots. -->
