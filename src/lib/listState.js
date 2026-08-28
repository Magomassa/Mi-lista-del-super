export function toggleProduct(state, productId) {
  if (state[productId]?.selected) {
    const next = { ...state }
    delete next[productId]
    return next
  }

  return {
    ...state,
    [productId]: { selected: true, quantity: 1, note: '' },
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
