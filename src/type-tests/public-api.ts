import type { App } from 'vue'
import VueUI, {
  type AuthResolver,
  type ButtonSize,
  type ButtonType,
  type ButtonVariant,
  type DatePickerDate,
  type DatePickerView,
  type DatePickerYearRange,
  type InputType,
  type VueUIPluginOptions
} from '../index.js'

declare const app: App

const resolver: AuthResolver = ({ permission, requireAll }) => Boolean(permission) && Boolean(requireAll)
const options: VueUIPluginOptions = {
  prefix: 'Gspa',
  authResolver: resolver,
  iconAdapter: ({ name }) => name === 'shield' ? { render: () => null } : null
}

VueUI.install?.(app, options)

const variant: ButtonVariant = 'primaryOutline'
const size: ButtonSize = 'icon-lg'
const buttonType: ButtonType = 'submit'
const inputType: InputType = 'email'
const datePickerDate: DatePickerDate = '1990-06-15'
const datePickerView: DatePickerView = 'year'
const datePickerYearRange: DatePickerYearRange = [1900, new Date().getFullYear()]
void [variant, size, buttonType, inputType, datePickerDate, datePickerView, datePickerYearRange]

// @ts-expect-error Invalid variants must be rejected by consumers.
const invalidVariant: ButtonVariant = 'brand-new-variant'
void invalidVariant
