import { describe, expect, it } from 'vitest'
import { changeQuantity, toggleProduct, updateProduct } from './listState'

describe('list state', () => {
  it('starts a selected product with its explicit default quantity', () => {
    expect(toggleProduct({}, { id: 'jabon-pan-blanco', defaultQuantity: 2 })).toEqual({
      'jabon-pan-blanco': { selected: true, quantity: 2, note: '' },
    })
  })

  it('increments quantity and never decrements below one', () => {
    const selected = { leche: { selected: true, quantity: 1, note: '' } }
    const incremented = changeQuantity(selected, 'leche', 1)

    expect(incremented.leche.quantity).toBe(2)
    expect(changeQuantity(selected, 'leche', -1).leche.quantity).toBe(1)
  })

  it('keeps quantity and note when a product is unselected and reselected', () => {
    const selected = { leche: { selected: true, quantity: 1, note: '' } }
    const unselected = toggleProduct(selected, { id: 'leche', defaultQuantity: 4 })
    expect(unselected.leche).toEqual({ selected: false, quantity: 1, note: '' })
    expect(toggleProduct(unselected, { id: 'leche', defaultQuantity: 4 }).leche.quantity).toBe(1)
  })

  it('updates a product note without changing its quantity', () => {
    const selected = { leche: { selected: true, quantity: 2, note: '' } }
    expect(updateProduct(selected, 'leche', { note: 'Descremada' }).leche).toEqual({
      selected: true,
      quantity: 2,
      note: 'Descremada',
    })
  })
})
