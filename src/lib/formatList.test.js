import { describe, expect, it } from 'vitest'
import { formatList } from './formatList'

const catalog = [
  { id: 'lacteos', name: 'Lácteos', products: [{ id: 'leche', name: 'Leche' }] },
  {
    id: 'almacen',
    name: 'Almacén',
    products: [
      { id: 'arroz', name: 'Arroz' },
      { id: 'fideos', name: 'Fideos' },
    ],
  },
]

describe('formatList', () => {
  it('adds the current date and selected products in category order', () => {
    const state = {
      leche: { selected: true, quantity: 2, note: 'descremada' },
      arroz: { selected: true, quantity: 1, note: '' },
    }

    expect(formatList(catalog, state, new Date(2026, 7, 28))).toBe(
      'LISTA DEL SÚPER — 28/08/2026\n\n' +
        'LÁCTEOS\n' +
        '• Leche — 2 (descremada)\n\n' +
        'ALMACÉN\n' +
        '• Arroz — 1',
    )
  })

  it('omits categories and products without selections', () => {
    const state = { arroz: { selected: true, quantity: 1, note: '' } }
    const output = formatList(catalog, state, new Date(2026, 7, 28))
    expect(output).not.toContain('LÁCTEOS')
    expect(output).not.toContain('Fideos')
  })

  it('places selected custom items in Otros at the end', () => {
    const state = {
      arroz: { selected: true, quantity: 1, note: '' },
      toast: { id: 'toast', name: 'Tostadora', custom: true, selected: true, quantity: 1, note: 'negra' },
    }
    const output = formatList(catalog, state, new Date(2026, 7, 30))
    expect(output).toContain('OTROS\n• Tostadora — 1 (negra)')
    expect(output.indexOf('OTROS')).toBeGreaterThan(output.indexOf('ALMACÉN'))
  })

  it('omits Otros when every custom item is unselected', () => {
    const state = { toast: { id: 'toast', name: 'Tostadora', custom: true, selected: false, quantity: 1, note: '' } }
    expect(formatList(catalog, state, new Date(2026, 7, 30))).not.toContain('OTROS')
  })
})
