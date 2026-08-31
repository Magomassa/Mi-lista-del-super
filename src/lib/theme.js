export const THEME_KEY = 'lista-super:theme'

export function resolveTheme(storage = localStorage, media) {
  try {
    const saved = storage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Si localStorage está bloqueado, se usa la preferencia del sistema.
  }
  const systemPreference = media ?? globalThis.matchMedia?.('(prefers-color-scheme: dark)')
  return systemPreference?.matches ? 'dark' : 'light'
}

export function saveTheme(theme, storage = localStorage) {
  if (theme !== 'light' && theme !== 'dark') return
  try {
    storage.setItem(THEME_KEY, theme)
  } catch {
    // El tema sigue activo durante la sesión aunque no pueda persistirse.
  }
}

export function applyTheme(theme, root = document.documentElement) {
  root.dataset.theme = theme === 'dark' ? 'dark' : 'light'
}
