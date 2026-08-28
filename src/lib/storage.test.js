import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadList, saveList, STORAGE_KEY } from './storage'

describe('list storage', () => {
  beforeEach(() => localStorage.clear())

  it('loads a saved list', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ leche: { selected: true, quantity: 1, note: '' } }))
    expect(loadList()).toEqual({ leche: { selected: true, quantity: 1, note: '' } })
  })

  it('returns an empty list for invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid')
    expect(loadList()).toEqual({})
  })

  it('does not throw when storage cannot be written', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable')
    })
    expect(() => saveList({})).not.toThrow()
    setItem.mockRestore()
  })
})
