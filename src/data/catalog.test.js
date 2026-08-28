import { describe, expect, it } from 'vitest'
import { categories } from './catalog'

describe('real catalog', () => {
  const products = categories.flatMap((category) => category.products)

  it('contains the three real categories and no V1 sample products', () => {
    expect(categories.map((category) => category.name)).toEqual([
      'Artículos de limpieza',
      'Artículos de tocador',
      'Comestibles',
    ])
    expect(products).toHaveLength(70)
    expect(products.some((product) => ['Banana', 'Manzana', 'Papa', 'Tomate'].includes(product.name))).toBe(false)
  })

  it('keeps package sizes in product names', () => {
    expect(products).toContainEqual(expect.objectContaining({
      name: 'Jabón Líquido Ariel x 800 ml',
      defaultQuantity: 1,
    }))
    expect(products).toContainEqual(expect.objectContaining({
      name: 'Jabón en Polvo Ace envase naranja x 800 grs.',
      defaultQuantity: 1,
    }))
  })

  it('defines unique stable IDs and explicit default quantities', () => {
    expect(new Set(products.map((product) => product.id)).size).toBe(products.length)
    expect(products.every((product) => Number.isInteger(product.defaultQuantity) && product.defaultQuantity > 0)).toBe(true)
  })
})
