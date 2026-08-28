export const STORAGE_KEY = 'lista-super:v1'

export function loadList() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return {}
    const parsed = JSON.parse(saved)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function saveList(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // La lista sigue funcionando aunque el almacenamiento esté bloqueado.
  }
}
