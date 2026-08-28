import { describe, expect, it } from 'vitest'
import { changeQuantity, toggleProduct, updateProduct } from './listState'

describe('list state', () => {
  it('starts a selected product with quantity one', () => {
    expect(toggleProduct({}, 'leche')).toEqual({
      leche: { selected: true, quantity: 1, note: '' },
    })
  })

  it('increments quantity and never decrements below one', () => {
    const selected = { leche: { selected: true, quantity: 1, note: '' } }
    const incremented = changeQuantity(selected, 'leche', 1)

    expect(incremented.leche.quantity).toBe(2)
    expect(changeQuantity(selected, 'leche', -1).leche.quantity).toBe(1)
  })

  it('removes a product when it is unselected', () => {
    const selected = { leche: { selected: true, quantity: 1, note: '' } }
    expect(toggleProduct(selected, 'leche')).toEqual({})
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
