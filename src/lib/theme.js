const MODE_KEY = 'ui-mode'
const THEME_KEY = 'ui-theme'
const DEFAULT_PRESET_KEY = 'ocean'

const isBrowser = () => typeof document !== 'undefined'

const applyMode = (mode) => {
  if (!isBrowser()) return
  document.documentElement.setAttribute('data-mode', mode)
}

export const getMode = () => {
  if (!isBrowser()) return null
  return document.documentElement.getAttribute('data-mode')
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const normalizeHex = (value, fallback = '#0070f3') => {
  if (!value) return fallback
  let hex = String(value).trim().replace('#', '')
  if (hex.length === 3) hex = hex.split('').map((char) => char + char).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return fallback
  return `#${hex.toLowerCase()}`
}

const hexToRgb = (hex) => {
  const safeHex = normalizeHex(hex)
  const clean = safeHex.slice(1)
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  }
}

const rgbToHex = ({ r, g, b }) => {
  const toHex = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const mixColors = (baseHex, mixHex, weight = 0.5) => {
  const w = clamp(weight, 0, 1)
  const a = hexToRgb(baseHex)
  const b = hexToRgb(mixHex)
  return rgbToHex({
    r: a.r * (1 - w) + b.r * w,
    g: a.g * (1 - w) + b.g * w,
    b: a.b * (1 - w) + b.b * w
  })
}

const getContrastText = (hex) => {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.62 ? '#111111' : '#ffffff'
}

export const THEME_PRESETS = [
  {
    key: 'ocean',
    name: 'Ocean Blue',
    light: { primary: '#1d4ed8', secondary: ['#0ea5e9', '#22c55e', '#f59e0b'] },
    dark: { primary: '#2ccad3', secondary: ['#39d9df', '#2fa6ff', '#1fc8b3'] }
  },
  {
    key: 'forest',
    name: 'Forest Green',
    light: { primary: '#0f766e', secondary: ['#14b8a6', '#6366f1', '#f97316'] },
    dark: { primary: '#22c7bc', secondary: ['#2fded1', '#2fa6ff', '#1ea8c2'] }
  },
  {
    key: 'violet',
    name: 'Royal Violet',
    light: { primary: '#7c3aed', secondary: ['#a855f7', '#3b82f6', '#ef4444'] },
    dark: { primary: '#3bc8f0', secondary: ['#59d6ff', '#29c5d8', '#1da1be'] }
  },
  {
    key: 'sunset',
    name: 'Sunset',
    light: { primary: '#ea580c', secondary: ['#fb7185', '#f59e0b', '#8b5cf6'] },
    dark: { primary: '#36cfd1', secondary: ['#58dcde', '#2fb7ff', '#21c4a1'] }
  },
  {
    key: 'graphite',
    name: 'Graphite',
    light: { primary: '#334155', secondary: ['#64748b', '#0ea5e9', '#22c55e'] },
    dark: { primary: '#2fb6d7', secondary: ['#5fd8ea', '#2da5e9', '#22c4b5'] }
  }
]

export const getThemePreset = (presetKey) => {
  const key = String(presetKey || DEFAULT_PRESET_KEY)
  return THEME_PRESETS.find((preset) => preset.key === key) || THEME_PRESETS[0]
}

export const buildThemeTokens = (theme = {}) => {
  const mode = getMode() || 'light'
  const preset = getThemePreset(theme.preset || theme.theme_preset)
  const presetPalette = mode === 'dark' ? preset.dark : preset.light
  const hasPreset = Boolean(theme.preset || theme.theme_preset)
  const useCustomPalette = Boolean(theme.use_custom || theme.useCustom)
  const shouldForcePresetPalette = hasPreset && !useCustomPalette

  const primary = shouldForcePresetPalette
    ? normalizeHex(presetPalette.primary, '#0070f3')
    : normalizeHex(theme.primary || theme.primary_color || presetPalette.primary, '#0070f3')

  const secondary = shouldForcePresetPalette
    ? presetPalette.secondary
    : (Array.isArray(theme.secondary)
      ? theme.secondary
      : [
        theme.secondary_1 || presetPalette.secondary[0],
        theme.secondary_2 || presetPalette.secondary[1],
        theme.secondary_3 || presetPalette.secondary[2]
      ])

  const secondary1 = normalizeHex(secondary?.[0], '#14b8a6')
  const secondary2 = normalizeHex(secondary?.[1], '#f97316')
  const secondary3 = normalizeHex(secondary?.[2], '#8b5cf6')
  const isDarkMode = mode === 'dark'
  const headerBg = isDarkMode
    ? mixColors(primary, '#042438', 0.92)
    : '#ffffff'
  const sidebarBg = isDarkMode
    ? mixColors(primary, '#031f31', 0.9)
    : '#ffffff'
  const submenuBg = isDarkMode
    ? mixColors(primary, '#03283e', 0.9)
    : '#ffffff'

  return {
    '--ui-primary': primary,
    '--ui-primary-strong': mixColors(primary, '#000000', 0.14),
    '--ui-primary-soft': mixColors(primary, '#ffffff', 0.86),
    '--ui-accent': secondary1,
    '--ui-accent-strong': mixColors(secondary1, '#000000', 0.14),
    '--ui-accent-soft': mixColors(secondary1, '#ffffff', 0.84),
    '--ui-success': secondary2,
    '--ui-success-strong': mixColors(secondary2, '#000000', 0.1),
    '--ui-success-soft': mixColors(secondary2, '#ffffff', 0.84),
    '--ui-warning': secondary3,
    '--ui-warning-strong': mixColors(secondary3, '#000000', 0.1),
    '--ui-warning-soft': mixColors(secondary3, '#ffffff', 0.84),
    '--ui-ring': mixColors(primary, '#ffffff', 0.28),
    '--ui-text-inverse': getContrastText(primary),
    '--ui-header-bg': headerBg,
    '--ui-sidebar-bg': sidebarBg,
    '--ui-submenu-bg': submenuBg
  }
}

export const getTheme = () => {
  if (!isBrowser()) return null
  const raw = localStorage.getItem(THEME_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const clearTheme = () => {
  if (!isBrowser()) return
  const root = document.documentElement
  const tokenKeys = Object.keys(buildThemeTokens({}))
  tokenKeys.forEach((key) => root.style.removeProperty(key))
  localStorage.removeItem(THEME_KEY)
}

export const setTheme = (theme, options = {}) => {
  if (!isBrowser()) return
  const { persist = true } = options
  if (!theme) {
    clearTheme()
    return
  }

  const tokens = buildThemeTokens(theme)
  const root = document.documentElement
  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })

  if (persist) {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme))
  }
}

export const setMode = (mode) => {
  if (!mode) return
  applyMode(mode)
  if (isBrowser()) {
    localStorage.setItem(MODE_KEY, mode)
    const storedTheme = getTheme()
    if (storedTheme) {
      setTheme(storedTheme, { persist: false })
    }
  }
}

export const initTheme = (options = {}) => {
  if (!isBrowser()) return
  const {
    defaultMode = 'light'
  } = options

  const storedMode = localStorage.getItem(MODE_KEY)

  applyMode(storedMode || defaultMode)

  const storedTheme = getTheme()
  if (storedTheme) {
    setTheme(storedTheme, { persist: false })
  }
}
