# DataTable Actions with Permission Checks

This guide demonstrates how to use the DataTable component's `actions` prop to define action buttons with built-in permission checks.

## Overview

The DataTable component now supports two ways to add action buttons:

1. **Actions Slot** (existing): Full control over action rendering
2. **Actions Prop** (new): Declarative actions with built-in permission checks

## Actions Prop Format

```javascript
const actions = [
  {
    key: 'edit',              // Unique identifier for the action
    label: 'Edit',            // Button label (optional if icon is provided)
    icon: 'pen',              // Icon name from your icon library
    variant: 'primary',       // Color variant: primary, secondary, danger, success, warning
    permission: (item) => true,  // Function to check if user has permission
    visible: (item) => true,     // Function to check if action should be visible
    disabled: (item) => false,   // Function to check if action should be disabled
    tooltip: 'Edit item',        // Tooltip text (shown on hover)
    onClick: (item) => {}        // Optional click handler
  }
]
```

**Note:** Actions are rendered using the `Button` component with `Tooltip` wrapper, providing consistent styling and hover tooltips across your application.

## Basic Example

```vue
<template>
  <DataTable
    :data="users"
    :columns="columns"
    :actions="tableActions"
    @action="handleAction"
  />
</template>

<script setup>
import { ref } from 'vue'
import DataTable from '@/components/DataTable.vue'

const users = ref([
  { id: 1, name: 'John Doe', role: 'admin', status: 'active' },
  { id: 2, name: 'Jane Smith', role: 'user', status: 'inactive' }
])

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true }
]

const tableActions = [
  {
    key: 'view',
    icon: 'eye',
    variant: 'primary',
    tooltip: 'View details'
  },
  {
    key: 'edit',
    icon: 'pen',
    variant: 'primary',
    tooltip: 'Edit user'
  },
  {
    key: 'delete',
    icon: 'trash',
    variant: 'danger',
    tooltip: 'Delete user'
  }
]

const handleAction = ({ action, item }) => {
  console.log(`Action: ${action}, Item:`, item)
  
  switch (action) {
    case 'view':
      viewUser(item)
      break
    case 'edit':
      editUser(item)
      break
    case 'delete':
      deleteUser(item)
      break
  }
}

const viewUser = (user) => {
  console.log('Viewing user:', user)
}

const editUser = (user) => {
  console.log('Editing user:', user)
}

const deleteUser = (user) => {
  console.log('Deleting user:', user)
}
</script>
```

## Permission-Based Actions

```vue
<script setup>
import { ref, computed } from 'vue'

// Current user permissions (from your auth system)
const currentUser = ref({
  id: 1,
  role: 'admin',
  permissions: ['users.view', 'users.edit', 'users.delete']
})

// Helper function to check permissions
const hasPermission = (permission) => {
  return currentUser.value.permissions.includes(permission)
}

const tableActions = [
  {
    key: 'view',
    icon: 'eye',
    variant: 'primary',
    tooltip: 'View details',
    // Always visible, no permission check needed
    permission: () => true
  },
  {
    key: 'edit',
    icon: 'pen',
    variant: 'primary',
    tooltip: 'Edit user',
    // Only show if user has edit permission
    permission: (item) => hasPermission('users.edit'),
    // Disable if user is trying to edit themselves
    disabled: (item) => item.id === currentUser.value.id
  },
  {
    key: 'delete',
    icon: 'trash',
    variant: 'danger',
    tooltip: 'Delete user',
    // Only show if user has delete permission
    permission: (item) => hasPermission('users.delete'),
    // Hide delete button for admin users
    visible: (item) => item.role !== 'admin',
    // Disable if user is trying to delete themselves
    disabled: (item) => item.id === currentUser.value.id
  }
]
</script>
```

## Role-Based Actions

```vue
<script setup>
const currentUserRole = ref('editor') // admin, editor, viewer

const tableActions = [
  {
    key: 'view',
    icon: 'eye',
    variant: 'primary',
    tooltip: 'View details',
    // All roles can view
    permission: () => true
  },
  {
    key: 'edit',
    icon: 'pen',
    variant: 'primary',
    tooltip: 'Edit user',
    // Only admins and editors can edit
    permission: () => ['admin', 'editor'].includes(currentUserRole.value)
  },
  {
    key: 'delete',
    icon: 'trash',
    variant: 'danger',
    tooltip: 'Delete user',
    // Only admins can delete
    permission: () => currentUserRole.value === 'admin'
  },
  {
    key: 'approve',
    icon: 'check',
    variant: 'success',
    tooltip: 'Approve user',
    // Only show for pending users
    visible: (item) => item.status === 'pending',
    // Only admins can approve
    permission: () => currentUserRole.value === 'admin'
  }
]
</script>
```

## Conditional Visibility Example

```vue
<script setup>
const tableActions = [
  {
    key: 'activate',
    icon: 'check',
    variant: 'success',
    tooltip: 'Activate user',
    // Only show for inactive users
    visible: (item) => item.status === 'inactive',
    permission: (item) => hasPermission('users.activate')
  },
  {
    key: 'deactivate',
    icon: 'times',
    variant: 'warning',
    tooltip: 'Deactivate user',
    // Only show for active users
    visible: (item) => item.status === 'active',
    permission: (item) => hasPermission('users.deactivate')
  },
  {
    key: 'restore',
    icon: 'undo',
    variant: 'secondary',
    tooltip: 'Restore user',
    // Only show for deleted users
    visible: (item) => item.deleted_at !== null,
    permission: (item) => hasPermission('users.restore')
  }
]
</script>
```

## Using with onClick Handler

```vue
<script setup>
const tableActions = [
  {
    key: 'edit',
    icon: 'pen',
    variant: 'primary',
    tooltip: 'Edit user',
    permission: (item) => hasPermission('users.edit'),
    // Optional: Handle click directly in action config
    onClick: (item) => {
      console.log('Edit clicked for:', item)
      // Open edit modal, navigate to edit page, etc.
    }
  }
]

// You can still use the @action event
const handleAction = ({ action, item, actionConfig }) => {
  console.log('Action event:', action, item)
  // This will be called in addition to onClick
}
</script>
```

## Complex Permission Logic

```vue
<script setup>
import { ref } from 'vue'

const currentUser = ref({
  id: 1,
  role: 'manager',
  department: 'Engineering',
  permissions: ['users.edit', 'users.view']
})

const tableActions = [
  {
    key: 'edit',
    icon: 'pen',
    variant: 'primary',
    tooltip: 'Edit user',
    permission: (item) => {
      // Complex permission logic
      const hasEditPermission = currentUser.value.permissions.includes('users.edit')
      const isOwnDepartment = item.department === currentUser.value.department
      const isNotSelf = item.id !== currentUser.value.id
      const isAdmin = currentUser.value.role === 'admin'
      
      // Admins can edit anyone
      // Managers can edit users in their department (except themselves)
      return isAdmin || (hasEditPermission && isOwnDepartment && isNotSelf)
    },
    disabled: (item) => {
      // Disable if user is currently being edited by someone else
      return item.locked_by && item.locked_by !== currentUser.value.id
    }
  },
  {
    key: 'delete',
    icon: 'trash',
    variant: 'danger',
    tooltip: 'Delete user',
    visible: (item) => {
      // Only show delete for non-admin users
      return item.role !== 'admin'
    },
    permission: (item) => {
      // Only admins or managers of the same department can delete
      const isAdmin = currentUser.value.role === 'admin'
      const isManager = currentUser.value.role === 'manager'
      const sameDepartment = item.department === currentUser.value.department
      
      return isAdmin || (isManager && sameDepartment)
    },
    disabled: (item) => {
      // Can't delete users with active sessions
      return item.has_active_session
    }
  }
]
</script>
```

## Hiding Actions Column

```vue
<template>
  <DataTable
    :data="users"
    :columns="columns"
    :actions="tableActions"
    :show-actions-column="false"
  />
</template>
```

## Using Both Actions Prop and Slot

```vue
<template>
  <DataTable
    :data="users"
    :columns="columns"
    :actions="tableActions"
  >
    <!-- Slot takes precedence over actions prop -->
    <template #actions="{ item }">
      <div class="flex items-center gap-2">
        <button @click="customAction(item)">
          Custom Action
        </button>
      </div>
    </template>
  </DataTable>
</template>
```

## Action Variants

The `variant` prop controls the button styling. All action buttons use the Button component with `icon` size and are mapped to the `ghost` variant for consistent, minimal styling in table rows:

- `primary`: Ghost button with subtle hover (default for view/edit actions)
- `secondary`: Ghost button with subtle hover
- `danger`: Ghost button with subtle hover (for delete/danger actions)
- `success`: Ghost button with subtle hover (for approve/activate actions)
- `warning`: Ghost button with subtle hover (for warning actions)
- `info`: Ghost button with subtle hover (for info actions)
- `default`: Ghost button with subtle hover

All variants use the Button component's `ghost` variant which provides:
- Transparent background
- Gray text color
- Subtle gray background on hover
- Consistent spacing and sizing

This ensures action buttons don't overwhelm the table design while remaining clearly interactive.

## Props Reference

### DataTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `actions` | Array | `[]` | Array of action configurations |
| `showActionsColumn` | Boolean | `true` | Whether to show the actions column |

### Action Configuration

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `key` | String | Yes | Unique identifier for the action |
| `label` | String | No | Button label (optional if icon provided) |
| `icon` | String | No | Icon name |
| `variant` | String | No | Color variant (primary, secondary, danger, success, warning) |
| `permission` | Function | No | `(item) => boolean` - Check if user has permission |
| `visible` | Function | No | `(item) => boolean` - Check if action should be visible |
| `disabled` | Function | No | `(item) => boolean` - Check if action should be disabled |
| `tooltip` | String | No | Tooltip text (displayed on hover using Tooltip component) |
| `onClick` | Function | No | `(item) => void` - Optional click handler |

## Events

### @action

Emitted when an action button is clicked.

```javascript
{
  action: 'edit',           // The action key
  item: { ... },           // The row item
  actionConfig: { ... }    // The full action configuration
}
```

## Best Practices

1. **Use permission functions**: Always implement permission checks to ensure users can only perform actions they're authorized for.

2. **Combine visible and permission**: Use `visible` to hide actions completely, and `permission` to show but disable them (provides better UX feedback).

3. **Provide tooltips**: Always include helpful tooltip text to explain what each action does.

4. **Use appropriate variants**: Choose color variants that match the action's intent (danger for delete, success for approve, etc.).

5. **Handle both onClick and @action**: You can use either or both depending on your needs. The `@action` event is useful for centralized handling.

6. **Keep permission logic simple**: Extract complex permission logic into separate functions for better maintainability.

7. **Consider loading states**: Disable actions during async operations to prevent duplicate submissions.

## Integration with Auth Systems

### Example with Pinia Store

```javascript
// stores/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    permissions: []
  }),
  getters: {
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission)
    },
    isAdmin: (state) => state.user?.role === 'admin'
  }
})

// In your component
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const tableActions = [
  {
    key: 'edit',
    icon: 'pen',
    variant: 'primary',
    tooltip: 'Edit user',
    permission: () => authStore.hasPermission('users.edit')
  }
]
```

This implementation provides a flexible, reusable way to add action buttons with permission checks to your DataTable components across different applications.
