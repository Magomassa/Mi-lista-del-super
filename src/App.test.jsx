import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { loadLastPurchase, loadTemplates, saveLastPurchase, saveTemplate } from './lib/storage'

const panSoap = { selected: true, quantity: 2, note: '' }

describe('Lista del Súper V2', () => {
  beforeEach(() => localStorage.clear())

  it('searches the real catalog and preserves package sizes in names', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByRole('searchbox', { name: /buscar/i }), 'Ariel')
    expect(screen.getByText('Jabón Líquido Ariel x 800 ml')).toBeInTheDocument()
    expect(screen.queryByText('Banana')).not.toBeInTheDocument()
  })

  it('uses each product default quantity and preserves edits when reselected', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('checkbox', { name: /^Jabón en pan blanco$/i }))
    const soap = screen.getByTestId('product-jabon-pan-blanco')
    expect(within(soap).getByLabelText(/cantidad/i)).toHaveValue(2)
    await user.click(within(soap).getByRole('button', { name: /sumar/i }))
    await user.click(screen.getByRole('checkbox', { name: /^Jabón en pan blanco$/i }))
    await user.click(screen.getByRole('checkbox', { name: /^Jabón en pan blanco$/i }))
    expect(within(soap).getByLabelText(/cantidad/i)).toHaveValue(3)

    await user.click(screen.getByRole('checkbox', { name: /Jabón Líquido Ariel x 800 ml/i }))
    expect(screen.getByLabelText(/cantidad de Jabón Líquido Ariel/i)).toHaveValue(1)
  })

  it('persists the current draft independently', async () => {
    const user = userEvent.setup()
    const view = render(<App />)
    await user.click(screen.getByRole('checkbox', { name: /Cif Crema/i }))
    view.unmount()
    render(<App />)
    expect(screen.getByRole('checkbox', { name: /Cif Crema/i })).toBeChecked()
  })

  it('saves and loads a named template without mutating its snapshot', async () => {
    const user = userEvent.setup()
    saveTemplate('Compra habitual', { 'jabon-pan-blanco': panSoap })
    Object.defineProperty(window, 'confirm', { configurable: true, value: vi.fn().mockReturnValue(true) })
    render(<App />)

    await user.click(screen.getByRole('button', { name: /listas guardadas/i }))
    await user.click(screen.getByRole('button', { name: /cargar Compra habitual/i }))
    const soap = screen.getByTestId('product-jabon-pan-blanco')
    await user.click(within(soap).getByRole('button', { name: /sumar/i }))
    expect(within(soap).getByLabelText(/cantidad/i)).toHaveValue(3)

    await user.click(screen.getByRole('button', { name: /listas guardadas/i }))
    await user.click(screen.getByRole('button', { name: /cargar Compra habitual/i }))
    expect(screen.getByLabelText(/cantidad de Jabón en pan blanco/i)).toHaveValue(2)
    expect(loadTemplates()[0].items['jabon-pan-blanco'].quantity).toBe(2)
  })

  it('asks before replacing a non-empty draft and keeps it when cancelled', async () => {
    const user = userEvent.setup()
    saveTemplate('Limpieza', { 'jabon-pan-blanco': panSoap })
    const confirm = vi.fn().mockReturnValue(false)
    Object.defineProperty(window, 'confirm', { configurable: true, value: confirm })
    render(<App />)

    await user.click(screen.getByRole('checkbox', { name: /Cif Crema/i }))
    await user.click(screen.getByRole('button', { name: /listas guardadas/i }))
    await user.click(screen.getByRole('button', { name: /cargar Limpieza/i }))
    expect(confirm).toHaveBeenCalledOnce()
    await user.click(screen.getByRole('button', { name: /volver/i }))
    expect(screen.getByRole('checkbox', { name: /Cif Crema/i })).toBeChecked()
  })

  it('requires explicit confirmation before updating a template', async () => {
    const user = userEvent.setup()
    saveTemplate('Habitual', { 'jabon-pan-blanco': panSoap })
    const confirm = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true)
    Object.defineProperty(window, 'confirm', { configurable: true, value: confirm })
    render(<App />)

    await user.click(screen.getByRole('button', { name: /listas guardadas/i }))
    await user.click(screen.getByRole('button', { name: /cargar Habitual/i }))
    await user.click(screen.getByRole('button', { name: /sumar Jabón en pan/i }))
    await user.click(screen.getByRole('button', { name: /listas guardadas/i }))

    await user.click(screen.getByRole('button', { name: /actualizar Habitual/i }))
    expect(loadTemplates()[0].items['jabon-pan-blanco'].quantity).toBe(2)
    await user.click(screen.getByRole('button', { name: /actualizar Habitual/i }))
    expect(loadTemplates()[0].items['jabon-pan-blanco'].quantity).toBe(3)
  })

  it('saves final actions as last purchase and allows loading it', async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockResolvedValue(undefined) } })
    render(<App />)

    await user.click(screen.getByRole('checkbox', { name: /Cif Crema/i }))
    await user.click(screen.getByRole('button', { name: /ver lista/i }))
    await user.click(screen.getByRole('button', { name: /copiar/i }))
    expect(loadLastPurchase()['cif-crema'].selected).toBe(true)
    await user.click(screen.getByRole('button', { name: /volver/i }))
    await user.click(screen.getByRole('button', { name: /listas guardadas/i }))
    expect(screen.getByRole('button', { name: /cargar última compra/i })).toBeInTheDocument()
  })

  it('a new list resets products to their default quantity', async () => {
    const user = userEvent.setup()
    Object.defineProperty(window, 'confirm', { configurable: true, value: vi.fn().mockReturnValue(true) })
    render(<App />)
    await user.click(screen.getByRole('checkbox', { name: /^Jabón en pan blanco$/i }))
    await user.click(screen.getByRole('button', { name: /sumar Jabón en pan/i }))
    await user.click(screen.getByRole('button', { name: /ver lista/i }))
    await user.click(screen.getByRole('button', { name: /lista nueva/i }))
    await user.click(screen.getByRole('button', { name: /volver a elegir/i }))
    await user.click(screen.getByRole('checkbox', { name: /^Jabón en pan blanco$/i }))
    expect(screen.getByLabelText(/cantidad de Jabón en pan blanco/i)).toHaveValue(2)
  })

  it('creates and deletes a template through the accessible dialog', async () => {
    const user = userEvent.setup()
    Object.defineProperty(window, 'confirm', { configurable: true, value: vi.fn().mockReturnValue(true) })
    render(<App />)
    await user.click(screen.getByRole('checkbox', { name: /Cif Crema/i }))
    await user.click(screen.getByRole('button', { name: /listas guardadas/i }))
    await user.click(screen.getByRole('button', { name: /guardar selección actual/i }))
    await user.type(screen.getByRole('textbox', { name: /nombre de la lista/i }), 'Compra grande')
    await user.click(screen.getByRole('button', { name: /^guardar$/i }))
    expect(screen.getByText('Compra grande')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /eliminar Compra grande/i }))
    expect(screen.queryByText('Compra grande')).not.toBeInTheDocument()
  })

  it('shows a previously saved last purchase', async () => {
    const user = userEvent.setup()
    saveLastPurchase({ 'jabon-pan-blanco': panSoap })
    render(<App />)
    await user.click(screen.getByRole('button', { name: /listas guardadas/i }))
    expect(screen.getByText(/última compra disponible/i)).toBeInTheDocument()
  })
})
