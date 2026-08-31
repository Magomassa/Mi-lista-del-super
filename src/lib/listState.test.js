import { describe, expect, it } from 'vitest'
import {
  areAllSelected,
  changeQuantity,
  createCustomItem,
  deleteCustomItem,
  getCustomItems,
  hasRelevantDraft,
  renameCustomItem,
  toggleProduct,
  toggleProducts,
  updateProduct,
} from './listState'

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

describe('bulk selection', () => {
  const products = [{ id: 'a', defaultQuantity: 2 }, { id: 'b', defaultQuantity: 1 }]
  const custom = { c: { id: 'c', name: 'Tostadora', custom: true, selected: false, quantity: 4, note: 'negra' } }

  it('selects only supplied catalog products with their defaults', () => {
    const selected = toggleProducts(custom, products)
    expect(selected.a).toEqual({ selected: true, quantity: 2, note: '' })
    expect(selected.b.selected).toBe(true)
    expect(selected.c).toEqual(custom.c)
    expect(areAllSelected(selected, products)).toBe(true)
  })

  it('deselects supplied products while preserving their details', () => {
    const selected = { ...toggleProducts(custom, products), a: { selected: true, quantity: 5, note: 'marca' } }
    const unselected = toggleProducts(selected, products)
    expect(unselected.a).toEqual({ selected: false, quantity: 5, note: 'marca' })
    expect(unselected.c).toEqual(custom.c)
  })
})

describe('custom items', () => {
  it('creates a selected item and renames it without changing its identity or details', () => {
    const created = createCustomItem({}, ' Tostadora ', () => 'uuid-1')
    expect(created['uuid-1']).toEqual({ id: 'uuid-1', name: 'Tostadora', custom: true, selected: true, quantity: 1, note: '' })
    const changed = updateProduct(created, 'uuid-1', { quantity: 2, note: 'negra' })
    const renamed = renameCustomItem(changed, 'uuid-1', 'Tostadora grande')
    expect(renamed['uuid-1']).toEqual({ id: 'uuid-1', name: 'Tostadora grande', custom: true, selected: true, quantity: 2, note: 'negra' })
  })

  it('lists and deletes only custom entries', () => {
    const state = { normal: { selected: true, quantity: 1, note: '' }, custom: { id: 'custom', name: 'Extra', custom: true, selected: false, quantity: 1, note: '' } }
    expect(getCustomItems(state).map((item) => item.id)).toEqual(['custom'])
    expect(deleteCustomItem(state, 'custom')).toEqual({ normal: state.normal })
  })
})

describe('relevant draft', () => {
  const categories = [{ products: [{ id: 'a', defaultQuantity: 2 }] }]
  it.each([
    [{ a: { selected: true, quantity: 2, note: '' } }],
    [{ a: { selected: false, quantity: 3, note: '' } }],
    [{ a: { selected: false, quantity: 2, note: 'algo' } }],
    [{ c: { id: 'c', name: 'Extra', custom: true, selected: false, quantity: 1, note: '' } }],
  ])('detects meaningful draft content', (state) => expect(hasRelevantDraft(state, categories)).toBe(true))

  it('ignores an empty or untouched unselected normal entry', () => {
    expect(hasRelevantDraft({}, categories)).toBe(false)
    expect(hasRelevantDraft({ a: { selected: false, quantity: 2, note: '' } }, categories)).toBe(false)
  })
})
