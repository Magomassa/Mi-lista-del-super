export const DRAFT_KEY = 'lista-super:v2:draft'
export const LAST_PURCHASE_KEY = 'lista-super:v2:last-purchase'
export const TEMPLATES_KEY = 'lista-super:v2:templates'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function readRaw(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key))
    return value ?? fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // La aplicación sigue funcionando aunque el almacenamiento esté bloqueado.
  }
}

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

function sanitizeEntry(value) {
  if (!isObject(value) || typeof value.selected !== 'boolean' || !Number.isInteger(value.quantity) || value.quantity < 1 || typeof value.note !== 'string') return null
  if (value.custom === true) {
    if (typeof value.id !== 'string' || !value.id.trim() || typeof value.name !== 'string' || !value.name.trim()) return null
    return { id: value.id, name: value.name, custom: true, selected: value.selected, quantity: value.quantity, note: value.note }
  }
  return { selected: value.selected, quantity: value.quantity, note: value.note }
}

function sanitizeDraft(value) {
  if (!isObject(value)) return {}
  return Object.fromEntries(Object.entries(value).flatMap(([id, entry]) => {
    const sanitized = sanitizeEntry(entry)
    return sanitized ? [[id, sanitized]] : []
  }))
}

export function loadDraft() {
  return sanitizeDraft(readRaw(DRAFT_KEY, {}))
}

export function saveDraft(draft) {
  write(DRAFT_KEY, sanitizeDraft(draft))
}

export function loadLastPurchase() {
  const value = readRaw(LAST_PURCHASE_KEY, null)
  return isObject(value) ? sanitizeDraft(value) : null
}

export function saveLastPurchase(draft) {
  write(LAST_PURCHASE_KEY, sanitizeDraft(draft))
}

export function loadTemplates() {
  const value = readRaw(TEMPLATES_KEY, [])
  if (!Array.isArray(value)) return []
  return value.flatMap((template) => {
    if (!isObject(template) || typeof template.id !== 'string' || !template.id || typeof template.name !== 'string' || !template.name.trim() || !isObject(template.items)) return []
    return [{ id: template.id, name: template.name, items: sanitizeDraft(template.items) }]
  })
}

export function saveTemplate(name, draft) {
  const template = {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    name: name.trim(),
    items: sanitizeDraft(draft),
  }
  write(TEMPLATES_KEY, [...loadTemplates(), template])
  return clone(template)
}

export function updateTemplate(id, draft) {
  const templates = loadTemplates().map((template) =>
    template.id === id ? { ...template, items: sanitizeDraft(draft) } : template,
  )
  write(TEMPLATES_KEY, templates)
  return templates.find((template) => template.id === id) ?? null
}

export function deleteTemplate(id) {
  write(TEMPLATES_KEY, loadTemplates().filter((template) => template.id !== id))
}
