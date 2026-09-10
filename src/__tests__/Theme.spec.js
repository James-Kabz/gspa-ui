import { beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  THEME_PRESETS,
  buildThemeTokens,
  getTheme,
  getThemePreset,
  initTheme,
  setMode,
  setTheme
} from '../lib/theme'

const channel = (hex, offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255
const luminance = (hex) => {
  const linear = (value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  return 0.2126 * linear(channel(hex, 1)) + 0.7152 * linear(channel(hex, 3)) + 0.0722 * linear(channel(hex, 5))
}
const contrast = (foreground, background) => {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

describe('Security Academy theme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-mode')
    document.documentElement.removeAttribute('style')
  })

  it('uses Security Academy as the default preset', () => {
    expect(THEME_PRESETS[0].key).toBe('academy')
    expect(getThemePreset()).toMatchObject({
      key: 'academy',
      name: 'Security Academy'
    })
  })

  it('builds the institutional navy and gold light palette', () => {
    setMode('light')

    const tokens = buildThemeTokens({ preset: 'academy' })

    expect(tokens['--ui-primary']).toBe('#173866')
    expect(tokens['--ui-accent']).toBe('#b98218')
    expect(tokens['--ui-success']).toBe('#14745d')
    expect(tokens['--ui-primary-contrast']).toBe('#ffffff')
  })

  it('uses dark navy surfaces and readable gold actions in dark mode', () => {
    setMode('dark')

    const tokens = buildThemeTokens({ preset: 'academy' })

    expect(tokens['--ui-primary']).toBe('#e2b84e')
    expect(tokens['--ui-primary-contrast']).toBe('#111111')
    expect(tokens['--ui-primary-soft']).toMatch(/^#[0-9a-f]{6}$/)
    expect(tokens['--ui-primary-soft']).not.toBe('#ffffff')
  })

  it('persists and restores the selected theme and mode', () => {
    setMode('dark')
    setTheme({ preset: 'academy' })

    expect(getTheme()).toEqual({ preset: 'academy' })
    expect(document.documentElement.style.getPropertyValue('--ui-primary')).toBe('#e2b84e')

    document.documentElement.removeAttribute('data-mode')
    initTheme()

    expect(document.documentElement.dataset.mode).toBe('dark')
  })

  it('keeps the default semantic text and action colours WCAG AA compliant', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8')
    const lightBlock = [...css.matchAll(/\n {2}html \{([\s\S]*?)\n {2}\}/g)]
      .map((match) => match[1])
      .find((block) => block.includes('--ui-bg')) || ''
    const darkBlock = [...css.matchAll(/\n {2}html\[data-mode="dark"\] \{([\s\S]*?)\n {2}\}/g)]
      .map((match) => match[1])
      .find((block) => block.includes('--ui-bg')) || ''
    const token = (block, name) => block.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1]

    expect(contrast(token(lightBlock, '--ui-text'), token(lightBlock, '--ui-surface'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(token(lightBlock, '--ui-primary-contrast'), token(lightBlock, '--ui-primary'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(token(darkBlock, '--ui-text'), token(darkBlock, '--ui-surface'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(token(darkBlock, '--ui-primary-contrast'), token(darkBlock, '--ui-primary'))).toBeGreaterThanOrEqual(4.5)
  })
})
