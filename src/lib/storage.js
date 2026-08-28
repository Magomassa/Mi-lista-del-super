export const DRAFT_KEY = 'lista-super:v2:draft'
export const LAST_PURCHASE_KEY = 'lista-super:v2:last-purchase'
export const TEMPLATES_KEY = 'lista-super:v2:templates'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function read(key, fallback, validate) {
  try {
    const value = JSON.parse(localStorage.getItem(key))
    return validate(value) ? clone(value) : fallback
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

export function loadDraft() {
  return read(DRAFT_KEY, {}, isObject)
}

export function saveDraft(draft) {
  write(DRAFT_KEY, clone(draft))
}

export function loadLastPurchase() {
  return read(LAST_PURCHASE_KEY, null, isObject)
}

export function saveLastPurchase(draft) {
  write(LAST_PURCHASE_KEY, clone(draft))
}

export function loadTemplates() {
  return read(TEMPLATES_KEY, [], Array.isArray)
}

export function saveTemplate(name, draft) {
  const template = {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    name: name.trim(),
    items: clone(draft),
  }
  write(TEMPLATES_KEY, [...loadTemplates(), template])
  return clone(template)
}

export function updateTemplate(id, draft) {
  const templates = loadTemplates().map((template) =>
    template.id === id ? { ...template, items: clone(draft) } : template,
  )
  write(TEMPLATES_KEY, templates)
  return templates.find((template) => template.id === id) ?? null
}

export function deleteTemplate(id) {
  write(TEMPLATES_KEY, loadTemplates().filter((template) => template.id !== id))
}
