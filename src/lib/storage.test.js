import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DRAFT_KEY,
  LAST_PURCHASE_KEY,
  TEMPLATES_KEY,
  deleteTemplate,
  loadDraft,
  loadLastPurchase,
  loadTemplates,
  saveDraft,
  saveLastPurchase,
  saveTemplate,
  updateTemplate,
} from './storage'

const selected = { item: { selected: true, quantity: 2, note: 'nota' } }

describe('V2 storage', () => {
  beforeEach(() => localStorage.clear())

  it('keeps draft, last purchase and templates under independent V2 keys', () => {
    saveDraft(selected)
    saveLastPurchase({ other: { selected: true, quantity: 1, note: '' } })
    saveTemplate('Habitual', selected)

    expect(localStorage.getItem(DRAFT_KEY)).toContain('item')
    expect(localStorage.getItem(LAST_PURCHASE_KEY)).toContain('other')
    expect(localStorage.getItem(TEMPLATES_KEY)).toContain('Habitual')
    expect(localStorage.getItem('lista-super:v1')).toBeNull()
  })

  it('returns safe defaults for invalid JSON', () => {
    localStorage.setItem(DRAFT_KEY, '{invalid')
    localStorage.setItem(LAST_PURCHASE_KEY, 'null')
    localStorage.setItem(TEMPLATES_KEY, '{}')
    expect(loadDraft()).toEqual({})
    expect(loadLastPurchase()).toBeNull()
    expect(loadTemplates()).toEqual([])
  })

  it('loads snapshots as independent copies', () => {
    saveLastPurchase(selected)
    const loaded = loadLastPurchase()
    loaded.item.quantity = 99
    expect(loadLastPurchase().item.quantity).toBe(2)
  })

  it('saves, updates and deletes named templates explicitly', () => {
    const template = saveTemplate('Habitual', selected)
    const loaded = loadTemplates()
    loaded[0].items.item.quantity = 8
    expect(loadTemplates()[0].items.item.quantity).toBe(2)

    updateTemplate(template.id, { item: { selected: true, quantity: 4, note: '' } })
    expect(loadTemplates()[0].items.item.quantity).toBe(4)

    deleteTemplate(template.id)
    expect(loadTemplates()).toEqual([])
  })

  it('does not throw when localStorage is unavailable', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    expect(() => saveDraft(selected)).not.toThrow()
    expect(() => saveLastPurchase(selected)).not.toThrow()
    expect(() => saveTemplate('Habitual', selected)).not.toThrow()
    setItem.mockRestore()
  })
})
