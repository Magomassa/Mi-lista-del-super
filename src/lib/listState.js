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
