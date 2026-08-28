import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('Lista del Súper', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('filters products by name', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByRole('searchbox', { name: /buscar/i }), 'leche')

    expect(screen.getByText('Leche')).toBeInTheDocument()
    expect(screen.queryByText('Arroz')).not.toBeInTheDocument()
  })

  it('selects a product, adjusts quantity and saves a note', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('checkbox', { name: /leche/i }))
    const product = screen.getByTestId('product-leche')
    expect(within(product).getByLabelText(/cantidad de leche/i)).toHaveValue(1)

    await user.click(within(product).getByRole('button', { name: /sumar leche/i }))
    expect(within(product).getByLabelText(/cantidad de leche/i)).toHaveValue(2)

    await user.click(within(product).getByRole('button', { name: /restar leche/i }))
    expect(within(product).getByLabelText(/cantidad de leche/i)).toHaveValue(1)

    await user.type(within(product).getByLabelText(/observación de leche/i), 'Descremada')
    expect(within(product).getByLabelText(/observación de leche/i)).toHaveValue('Descremada')
  })

  it('shows only selected products in the dated summary', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('checkbox', { name: /arroz/i }))
    await user.click(screen.getByRole('button', { name: /ver lista.*1/i }))

    expect(screen.getByRole('heading', { name: /lista del súper/i })).toBeInTheDocument()
    expect(screen.getByText(/\d{2}\/\d{2}\/\d{4}/)).toBeInTheDocument()
    expect(screen.getByText('Arroz')).toBeInTheDocument()
    expect(screen.queryByText('Leche')).not.toBeInTheDocument()
  })

  it('persists selections when remounted', async () => {
    const user = userEvent.setup()
    const view = render(<App />)
    await user.click(screen.getByRole('checkbox', { name: /queso/i }))
    view.unmount()

    render(<App />)
    expect(screen.getByRole('checkbox', { name: /queso/i })).toBeChecked()
  })

  it('copies, shares and prints the generated list', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    const share = vi.fn().mockResolvedValue(undefined)
    const print = vi.fn()
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })
    Object.defineProperty(window, 'print', { configurable: true, value: print })
    render(<App />)

    await user.click(screen.getByRole('checkbox', { name: /leche/i }))
    await user.click(screen.getByRole('button', { name: /ver lista/i }))
    await user.click(screen.getByRole('button', { name: /copiar/i }))
    expect(screen.getByRole('status')).toHaveTextContent(/copiada/i)
    expect(writeText.mock.calls[0][0]).toContain('LISTA DEL SÚPER')

    await user.click(screen.getByRole('button', { name: /compartir/i }))
    expect(share.mock.calls[0][0].text).toContain('Leche')

    await user.click(screen.getByRole('button', { name: /imprimir/i }))
    expect(print).toHaveBeenCalledOnce()
  })

  it('clears the list only after confirmation', async () => {
    const user = userEvent.setup()
    const confirm = vi.fn().mockReturnValue(true)
    Object.defineProperty(window, 'confirm', { configurable: true, value: confirm })
    render(<App />)

    await user.click(screen.getByRole('checkbox', { name: /tomate/i }))
    await user.click(screen.getByRole('button', { name: /ver lista/i }))
    await user.click(screen.getByRole('button', { name: /lista nueva/i }))

    expect(confirm).toHaveBeenCalledOnce()
    expect(screen.getByText(/todavía no seleccionaste/i)).toBeInTheDocument()
  })
})
