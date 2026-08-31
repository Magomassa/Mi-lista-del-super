export function toggleProduct(state, product) {
  const productId = product.id
  if (state[productId]) {
    return {
      ...state,
      [productId]: { ...state[productId], selected: !state[productId].selected },
    }
  }

  return {
    ...state,
    [productId]: { selected: true, quantity: product.defaultQuantity, note: '' },
  }
}

export function changeQuantity(state, productId, delta) {
  const item = state[productId]
  if (!item?.selected) return state

  return {
    ...state,
    [productId]: {
      ...item,
      quantity: Math.max(1, Number(item.quantity || 1) + delta),
    },
  }
}

export function updateProduct(state, productId, patch) {
  const item = state[productId]
  if (!item?.selected) return state

  const next = { ...item, ...patch }
  next.quantity = Math.max(1, Number(next.quantity) || 1)
  return { ...state, [productId]: next }
}

export function areAllSelected(state, products) {
  return products.length > 0 && products.every((product) => state[product.id]?.selected)
}

export function toggleProducts(state, products) {
  if (!products.length) return state
  const selected = !areAllSelected(state, products)
  const next = { ...state }
  products.forEach((product) => {
    const current = state[product.id]
    next[product.id] = current
      ? { ...current, selected }
      : { selected, quantity: product.defaultQuantity, note: '' }
  })
  return next
}

export function createCustomId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  if (globalThis.crypto?.getRandomValues) {
    const values = globalThis.crypto.getRandomValues(new Uint32Array(4))
    return `custom-${Date.now()}-${Array.from(values, (value) => value.toString(16)).join('')}`
  }
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function createCustomItem(state, name, createId = createCustomId) {
  const cleanName = name.trim()
  if (!cleanName) return state
  const id = createId()
  return {
    ...state,
    [id]: { id, name: cleanName, custom: true, selected: true, quantity: 1, note: '' },
  }
}

export function renameCustomItem(state, id, name) {
  const cleanName = name.trim()
  if (!cleanName || !state[id]?.custom) return state
  return { ...state, [id]: { ...state[id], name: cleanName } }
}

export function deleteCustomItem(state, id) {
  if (!state[id]?.custom) return state
  const next = { ...state }
  delete next[id]
  return next
}

export function getCustomItems(state) {
  return Object.values(state).filter((item) => item?.custom === true)
}

export function hasRelevantDraft(state, categories) {
  const defaults = new Map(
    categories.flatMap((category) => category.products.map((product) => [product.id, product.defaultQuantity])),
  )
  return Object.entries(state).some(([id, item]) => {
    if (!item) return false
    if (item.custom || item.selected || item.note?.trim()) return true
    const defaultQuantity = defaults.get(id)
    return defaultQuantity !== undefined && Number(item.quantity) !== defaultQuantity
  })
}
