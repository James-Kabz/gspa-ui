import type { App, Component, Plugin } from 'vue'

export type ComponentSize = 'sm' | 'md' | 'lg'
export type ButtonSize = '2xs' | 'xs' | 'sm' | 'default' | 'md' | 'lg' | 'xl' | '2xl' | 'icon-sm' | 'icon' | 'icon-lg'
export type ButtonVariant = 'primary' | 'default' | 'danger' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning' | 'info' | 'subtle' | 'dark' | 'light' | 'primaryOutline' | 'dangerOutline' | 'successOutline' | 'gradient'
export type ButtonType = 'button' | 'submit' | 'reset'
export type ButtonUnauthorizedBehavior = 'show' | 'hide' | 'disable'
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'color' | 'file' | 'checkbox' | 'month' | 'week' | 'datetime-local' | 'hidden' | 'range'
export type InputVariant = 'default' | 'error' | 'success'
export type FormFieldType = InputType
export type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'default' | 'danger'

export type AuthNamedItem = string | { name: string; [key: string]: unknown }
export type AuthCollection = AuthNamedItem[] | (() => AuthNamedItem[])
export type AuthRule = string | string[] | boolean | (() => boolean) | null

export interface AuthResolverContext {
  permission?: AuthRule
  role?: AuthRule
  requireAll?: boolean
}

export type AuthResolver = (context: AuthResolverContext) => boolean

export interface IconAdapterContext {
  name: string
  prefix: string
}

export type IconAdapterResult = Component | Record<string, unknown> | string | null | undefined
export type IconAdapter = (context: IconAdapterContext) => IconAdapterResult

export interface VueUIPluginOptions {
  prefix?: string
  authResolver?: AuthResolver | null
  permissions?: AuthCollection | null
  roles?: AuthCollection | null
  checkPermission?: ((permission: string) => boolean) | null
  checkAnyPermission?: ((permissions: string[]) => boolean) | null
  checkAllPermissions?: ((permissions: string[]) => boolean) | null
  checkRole?: ((role: string) => boolean) | null
  checkAnyRole?: ((roles: string[]) => boolean) | null
  iconAdapter?: IconAdapter | null
}

export type VueUIPlugin = Plugin & {
  install(app: App, options?: VueUIPluginOptions): void
}
