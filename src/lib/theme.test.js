import { describe, expect, it, vi } from 'vitest'
import { applyTheme, resolveTheme, saveTheme, THEME_KEY } from './theme'

function storageWith(value) {
  return { getItem: vi.fn().mockReturnValue(value), setItem: vi.fn() }
}

describe('theme preference', () => {
  it('prefers a valid manual preference over the system', () => {
    expect(resolveTheme(storageWith('dark'), { matches: false })).toBe('dark')
    expect(resolveTheme(storageWith('light'), { matches: true })).toBe('light')
  })

  it('uses the system when no valid manual preference exists', () => {
    expect(resolveTheme(storageWith(null), { matches: true })).toBe('dark')
    expect(resolveTheme(storageWith('invalid'), { matches: false })).toBe('light')
  })

  it('defaults safely when matchMedia is unavailable', () => {
    const original = globalThis.matchMedia
    delete globalThis.matchMedia
    expect(resolveTheme(storageWith(null))).toBe('light')
    globalThis.matchMedia = original
  })

  it('persists valid themes and ignores storage failures', () => {
    const storage = storageWith(null)
    saveTheme('dark', storage)
    expect(storage.setItem).toHaveBeenCalledWith(THEME_KEY, 'dark')
    expect(() => saveTheme('light', { setItem: () => { throw new Error('blocked') } })).not.toThrow()
  })

  it('applies the resolved theme to the root element', () => {
    const root = document.createElement('html')
    applyTheme('dark', root)
    expect(root).toHaveAttribute('data-theme', 'dark')
  })
})
