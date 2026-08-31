import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { categories } from './data/catalog'
import { loadDraft, loadLastPurchase, loadTemplates, saveDraft, saveTemplate } from './lib/storage'

function setSystemTheme(dark) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue({ matches: dark, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  })
}

describe('Lista del Súper V3', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    setSystemTheme(false)
  })

  it('uses system theme until a manual choice is persisted', async () => {
    setSystemTheme(true)
    const user = userEvent.setup()
    const view = render(<App />)
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    await user.click(screen.getByRole('button', { name: /activar modo claro/i }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(localStorage.getItem('lista-super:theme')).toBe('light')
    view.unmount()
    render(<App />)
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
  })

  it('selects and deselects every normal catalog product without affecting Otros', async () => {
    const custom = { id: 'custom-1', name: 'Tostadora', custom: true, selected: false, quantity: 3, note: 'negra' }
    saveDraft({ 'custom-1': custom })
    const normalProductCount = categories.flatMap((category) => category.products).length
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /^seleccionar todo$/i }))
    expect(screen.getByRole('button', { name: `Ver lista (${normalProductCount})` })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Tostadora/i })).not.toBeChecked()
    expect(loadDraft()['custom-1']).toEqual(custom)

    await user.click(screen.getByRole('button', { name: /^deseleccionar todo$/i }))
    expect(screen.getByRole('button', { name: 'Ver lista (0)' })).toBeDisabled()
  })

  it('selects only one category and preserves defaults', async () => {
    const user = userEvent.setup()
    const category = categories[0]
    render(<App />)
    await user.click(screen.getByRole('button', { name: `Seleccionar todos en ${category.name}` }))
    expect(screen.getByRole('button', { name: `Ver lista (${category.products.length})` })).toBeInTheDocument()
    expect(screen.getByLabelText(/cantidad de Lisoform para el piso/i)).toHaveValue(2)
    expect(screen.getByRole('checkbox', { name: /Algodón Estrella/i })).not.toBeChecked()
  })

  it('creates, edits and finds a custom item while preserving its ID and details', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /agregar artículo/i }))
    await user.type(screen.getByRole('textbox', { name: /nombre del artículo/i }), 'Tostadora')
    await user.click(screen.getByRole('button', { name: /^agregar$/i }))

    const item = screen.getByRole('checkbox', { name: /Tostadora/i }).closest('article')
    const id = item.dataset.testid.replace('product-', '')
    expect(within(item).getByRole('checkbox', { name: /Tostadora/i })).toBeChecked()
    expect(within(item).getByLabelText(/cantidad/i)).toHaveValue(1)
    await user.click(within(item).getByRole('button', { name: /sumar/i }))
    await user.type(within(item).getByLabelText(/observación/i), 'negra')
    await user.click(within(item).getByRole('button', { name: /editar/i }))
    const name = screen.getByRole('textbox', { name: /nombre del artículo/i })
    await user.clear(name)
    await user.type(name, 'Tostadora grande')
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

    expect(screen.getByTestId(`product-${id}`)).toHaveTextContent('Tostadora grande')
    expect(screen.getByLabelText(/cantidad de Tostadora grande/i)).toHaveValue(2)
    expect(screen.getByLabelText(/observación de Tostadora grande/i)).toHaveValue('negra')
    await user.type(screen.getByRole('searchbox', { name: /buscar/i }), 'tost')
    expect(screen.getByText('Tostadora grande')).toBeInTheDocument()
    expect(loadDraft()[id].id).toBe(id)
  })

  it('includes custom items in count, summary and generated copy text', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    saveDraft({ custom: { id: 'custom', name: 'Tostadora', custom: true, selected: true, quantity: 1, note: 'negra' } })
    render(<App />)
    expect(screen.getByText('1 seleccionados')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /ver lista \(1\)/i }))
    expect(screen.getByRole('heading', { name: 'Otros' })).toBeInTheDocument()
    expect(screen.getByText('Tostadora')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /copiar/i }))
    expect(writeText.mock.calls[0][0]).toContain('OTROS\n• Tostadora — 1 (negra)')
    expect(loadLastPurchase().custom.name).toBe('Tostadora')
  })

  it('deletes custom items after confirmation and clears them on a new list', async () => {
    const user = userEvent.setup()
    Object.defineProperty(window, 'confirm', { configurable: true, value: vi.fn().mockReturnValue(true) })
    saveDraft({ custom: { id: 'custom', name: 'Extra', custom: true, selected: true, quantity: 1, note: '' } })
    render(<App />)
    await user.click(screen.getByRole('button', { name: /eliminar Extra/i }))
    expect(screen.queryByText('Extra')).not.toBeInTheDocument()
    expect(loadDraft().custom).toBeUndefined()
  })

  it('removes custom items when starting a completely new list', async () => {
    const user = userEvent.setup()
    Object.defineProperty(window, 'confirm', { configurable: true, value: vi.fn().mockReturnValue(true) })
    saveDraft({ custom: { id: 'custom', name: 'Extra', custom: true, selected: true, quantity: 1, note: '' } })
    render(<App />)
    await user.click(screen.getByRole('button', { name: /ver lista/i }))
    await user.click(screen.getByRole('button', { name: /lista nueva/i }))
    await user.click(screen.getByRole('button', { name: /volver a elegir/i }))
    expect(screen.queryByText('Extra')).not.toBeInTheDocument()
    expect(loadDraft()).toEqual({})
  })

  it('keeps template custom snapshots independent and protects relevant drafts', async () => {
    const template = { custom: { id: 'custom', name: 'Tostadora', custom: true, selected: true, quantity: 1, note: '' } }
    saveTemplate('Con extra', template)
    saveDraft({ draftCustom: { id: 'draftCustom', name: 'Guardado', custom: true, selected: false, quantity: 1, note: '' } })
    const confirm = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true)
    Object.defineProperty(window, 'confirm', { configurable: true, value: confirm })
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /listas guardadas/i }))
    await user.click(screen.getByRole('button', { name: /cargar Con extra/i }))
    expect(confirm).toHaveBeenCalledOnce()
    await user.click(screen.getByRole('button', { name: /cargar Con extra/i }))
    await user.click(screen.getByRole('button', { name: /editar Tostadora/i }))
    const input = screen.getByRole('textbox', { name: /nombre del artículo/i })
    await user.clear(input)
    await user.type(input, 'Tostadora nueva')
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))
    expect(loadTemplates()[0].items.custom.name).toBe('Tostadora')
  })
})
