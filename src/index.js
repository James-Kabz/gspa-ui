import Avatar from "./components/Avatar.vue"
import Badge from "./components/Badge.vue"
import Button from "./components/Button.vue"
import Checkbox from "./components/Checkbox.vue"
import Divider from "./components/Divider.vue"
import Icon from "./components/Icon.vue"
import Image from "./components/Image.vue"
import Input from "./components/Input.vue"
import Label from "./components/Label.vue"
import Link from "./components/Link.vue"
import Logo from "./components/Logo.vue"
import Option from "./components/Option.vue"
import Progress from "./components/Progress.vue"
import ProgressBar from "./components/ProgressBar.vue"
import CircularProgress from "./components/CircularProgress.vue"
import Radio from "./components/Radio.vue"
import Select from "./components/Select.vue"
import Spinner from "./components/Spinner.vue"
import Switch from "./components/Switch.vue"
import Text from "./components/Text.vue"
import Textarea from "./components/Textarea.vue"
import Tooltip from "./components/Tooltip.vue"
import Typography from "./components/Typography.vue"
import ThemeConfigurator from "./components/ThemeConfigurator.vue"

import Alert from "./components/Alert.vue"
import Breadcrumb from "./components/Breadcrumb.vue"
import ButtonGroup from "./components/ButtonGroup.vue"
import Card from "./components/Card.vue"
import CardHeader from "./components/CardHeader.vue"
import CardBody from "./components/CardBody.vue"
import CardFooter from "./components/CardFooter.vue"
import CardContent from "./components/CardContent.vue"
import CardTitle from "./components/CardTitle.vue"
import DatePicker from "./components/DatePicker.vue"
import Dropdown from "./components/Dropdown.vue"
import DropdownItem from "./components/DropdownItem.vue"
import FileUpload from "./components/FileUpload.vue"
import FormField from "./components/FormField.vue"
import InputGroup from "./components/InputGroup.vue"

import ListItem from "./components/ListItem.vue"
import MenuItem from "./components/MenuItem.vue"

import Modal from "./components/Modal.vue"
import ModalHeader from "./components/ModalHeader.vue"
import ModalBody from "./components/ModalBody.vue"
import ModalFooter from "./components/ModalFooter.vue"
import Notification from "./components/Notification.vue"
import Toast from "./components/Toast.vue"
import MultiSelect from "./components/MultiSelect.vue"

import Search from "./components/Search.vue"

import Slider from "./components/Slider.vue"
import Stepper from "./components/Stepper.vue"
import StepperItem from "./components/StepperItem.vue"
import Tab from "./components/Tab.vue"
import TabPanel from "./components/TabPanel.vue"

import Accordion from "./components/Accordion.vue"
import AccordionItem from "./components/AccordionItem.vue"
import Calendar from "./components/Calendar.vue"
import Graph from "./components/Graph.vue"
import BarChart from "./components/charts/BarChart.vue"
import LineChart from "./components/charts/LineChart.vue"
import PieChart from "./components/charts/PieChart.vue"
import GraphFilters from "./components/GraphFilters.vue"
import DataTable from "./components/DataTable.vue"
import DataTableHeader from "./components/DataTableHeader.vue"
import DataTableRow from "./components/DataTableRow.vue"
import DataTableCell from "./components/DataTableCell.vue"
import DataTablePagination from "./components/DataTablePagination.vue"
import DataTableFilters from "./components/DataTableFilters.vue"
import DataTableToolBar from "./components/DataTableToolBar.vue"
import RailNav from "./components/RailNav.vue"
import FilterDrawer from "./components/FilterDrawer.vue"

import Footer from "./components/Footer.vue"
import Header from "./components/Header.vue"
import ReusableFormModal from "./components/ReusableFormModal.vue"
import ReusableForm from "./components/ReusableForm.vue"
import RightDrawer from "./components/RightDrawer.vue"
import Sidebar from "./components/Sidebar.vue"
import Timeline from "./components/Timeline.vue"
import TimelineItem from "./components/TimelineItem.vue"

import AuthLayout from "./layouts/AuthLayout.vue"
import DefaultLayout from "./layouts/DefaultLayout.vue"
import ErrorLayout from "./layouts/ErrorLayout.vue"

import DashboardWidget from "./components/widgets/DashboardWidget.vue"
import ReminderConfig from "./components/ReminderConfig.vue"

// Import toast function and composable (not a component!)
import { toast, useToaster } from './lib/toast'
import { initTheme, setTheme, setMode, getTheme, getMode } from './lib/theme'
import { AUTH_RESOLVER_KEY } from "./lib/auth.js"
import { tooltip } from "./directives/tooltip.js"
// Utils
export { cn } from "./utils/cn.js"

// Styles
import "./styles/base.css"
import Loader from "./components/Loader.vue"
import EventsCalendar from "./components/EventsCalendar.vue"
import StackedBarChart from "./components/charts/StackedBarChart.vue"

const components = {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Divider,
  Icon,
  Image,
  Input,
  Label,
  Link,
  Logo,
  Option,
  CircularProgress,
  Progress,
  ProgressBar,
  Radio,
  Select,
  Spinner,
  Switch,
  Text,
  Textarea,
  Tooltip,
  Typography,
  ThemeConfigurator,
  Loader,
  Alert,
  Breadcrumb,
  ButtonGroup,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardContent,
  CardTitle,
  DatePicker,
  Dropdown,
  DropdownItem,
  FileUpload,
  FormField,
  InputGroup,
  ListItem,
  MenuItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Notification,
  Toast,
  MultiSelect,
  Search,
  Slider,
  Stepper,
  StepperItem,
  Tab,
  TabPanel,
  BarChart,
  LineChart,
  PieChart,
  StackedBarChart,
  GraphFilters,
  Accordion,
  AccordionItem,
  Graph,
  Calendar,
  EventsCalendar,
  DataTable,
  DataTableHeader,
  DataTableRow,
  DataTableCell,
  DataTablePagination,
  DataTableFilters,
  DataTableToolBar,
  FilterDrawer,
  RailNav,
  Footer,
  Header,
  ReusableFormModal,
  ReusableForm,
  RightDrawer,
  Sidebar,
  Timeline,
  TimelineItem,
  AuthLayout,
  DefaultLayout,
  ErrorLayout,
  DashboardWidget,
  ReminderConfig
}

const normalizeName = (value) => {
  if (typeof value === "string") return value
  if (value && typeof value === "object" && typeof value.name === "string") return value.name
  return null
}

const resolveCollection = (value) => {
  return typeof value === "function" ? value() : value
}

const createFallbackAuthResolver = (options = {}) => {
  const {
    permissions = null,
    roles = null,
    checkPermission = null,
    checkAnyPermission = null,
    checkAllPermissions = null,
    checkRole = null,
    checkAnyRole = null,
  } = options

  const hasAuthConfig =
    permissions !== null ||
    roles !== null ||
    typeof checkPermission === "function" ||
    typeof checkAnyPermission === "function" ||
    typeof checkAllPermissions === "function" ||
    typeof checkRole === "function" ||
    typeof checkAnyRole === "function"

  if (!hasAuthConfig) return null

  const listHasName = (collection, target) => {
    if (!Array.isArray(collection) || !target) return false
    return collection.some((item) => normalizeName(item) === target)
  }

  const evaluatePermission = (permission, requireAll = false) => {
    if (permission === null || permission === undefined) return true
    if (typeof permission === "boolean") return permission
    if (typeof permission === "function") return !!permission()

    const normalizedPermissions = resolveCollection(permissions)

    if (Array.isArray(permission)) {
      if (requireAll) {
        if (typeof checkAllPermissions === "function") return !!checkAllPermissions(permission)
        return permission.every((item) => listHasName(normalizedPermissions, item))
      }

      if (typeof checkAnyPermission === "function") return !!checkAnyPermission(permission)
      return permission.some((item) => listHasName(normalizedPermissions, item))
    }

    if (typeof checkPermission === "function") return !!checkPermission(permission)
    return listHasName(normalizedPermissions, permission)
  }

  const evaluateRole = (role) => {
    if (role === null || role === undefined) return true
    if (typeof role === "boolean") return role
    if (typeof role === "function") return !!role()

    const normalizedRoles = resolveCollection(roles)

    if (Array.isArray(role)) {
      if (typeof checkAnyRole === "function") return !!checkAnyRole(role)
      return role.some((item) => listHasName(normalizedRoles, item))
    }

    if (typeof checkRole === "function") return !!checkRole(role)
    return listHasName(normalizedRoles, role)
  }

  return ({ permission, role, requireAll = false } = {}) => {
    return evaluatePermission(permission, requireAll) && evaluateRole(role)
  }
}

// Plugin installer
const VueUI = {
  install(app, options = {}) {
    const { prefix = "", authResolver = null } = options
    const resolvedAuthResolver =
      typeof authResolver === "function" ? authResolver : createFallbackAuthResolver(options)
    
    Object.keys(components).forEach((name) => {
      const componentName = prefix ? `${prefix}${name}` : name
      app.component(componentName, components[name])
    })
    
    app.config.globalProperties.$toast = toast
    app.provide('toast', toast)

    app.config.globalProperties.$tooltip = tooltip
    app.provide('tooltip', tooltip)

    app.config.globalProperties.$authResolver = resolvedAuthResolver
    app.config.globalProperties.$canAccess = resolvedAuthResolver
    app.provide(AUTH_RESOLVER_KEY, resolvedAuthResolver)
  },
}

// ✅ Default export (plugin install)
export default VueUI

// ✅ Named exports (for tree-shaking)
export {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Divider,
  Icon,
  Image,
  Input,
  Label,
  Link,
  Logo,
  Option,
  CircularProgress,
  Progress,
  ProgressBar,
  Radio,
  Select,
  Spinner,
  Switch,
  Text,
  Textarea,
  Tooltip,
  Typography,
  ThemeConfigurator,
  Loader,
  Alert,
  Breadcrumb,
  ButtonGroup,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardContent,
  CardTitle,
  DatePicker,
  Dropdown,
  DropdownItem,
  FileUpload,
  FormField,
  InputGroup,
  ListItem,
  MenuItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Notification,
  Toast,
  MultiSelect,
  Search,
  Slider,
  BarChart,
  GraphFilters,
  LineChart,
  PieChart,
  StackedBarChart,
  Stepper,
  StepperItem,
  Tab,
  TabPanel,
  Accordion,
  Graph,
  AccordionItem,
  Calendar,
  EventsCalendar,
  DataTable,
  DataTableHeader,
  DataTableRow,
  DataTableCell,
  DataTablePagination,
  DataTableFilters,
  DataTableToolBar,
  FilterDrawer,
  RailNav,
  // Backward-compatible aliases
  FilterDrawer as KvFilterDrawer,
  RailNav as KvRailNav,
  Footer,
  Header,
  ReusableFormModal,
  ReusableForm,
  RightDrawer,
  Sidebar,
  Timeline,
  TimelineItem,
  AuthLayout,
  DefaultLayout,
  ErrorLayout,
  DashboardWidget,
  ReminderConfig,
  // Theme helpers
  initTheme,
  setTheme,
  setMode,
  getTheme,
  getMode,
  // Export toast function and composable
  toast,
  useToaster,
  tooltip,
  AUTH_RESOLVER_KEY
}
