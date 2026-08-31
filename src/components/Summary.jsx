import { buildDisplayCategories } from '../lib/formatList'

function dateLabel(date = new Date()) {
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

export default function Summary({ categories, list, message, onBack, onCopy, onShare, onPrint, onClear }) {
  const selectedCategories = buildDisplayCategories(categories, list).flatMap((category) => {
    const products = category.products.filter((product) => list[product.id]?.selected)
    return products.length ? [{ ...category, products }] : []
  })
  return (
    <div className="app-shell summary-shell">
      <header className="summary-header no-print"><button className="back-button" type="button" onClick={onBack}>← Volver</button><span>Revisá antes de terminar</span></header>
      <main className="summary-view">
        <div className="print-title"><h1>Lista del Súper</h1><p>{dateLabel()}</p></div>
        {!selectedCategories.length ? (
          <div className="empty-state summary-empty"><span aria-hidden="true">🛒</span><p>Todavía no seleccionaste ningún producto.</p><button type="button" onClick={onBack}>Volver a elegir</button></div>
        ) : (
          <div className="summary-card">{selectedCategories.map((category) => (
            <section className="summary-category" key={category.id}><h2>{category.name}</h2><ul>{category.products.map((product) => {
              const entry = list[product.id]
              return <li key={product.id}><span>{product.name}</span><strong>{entry.quantity}</strong>{entry.note?.trim() && <small>{entry.note.trim()}</small>}</li>
            })}</ul></section>
          ))}</div>
        )}
        {message && <p className="feedback no-print" role="status">{message}</p>}
        {selectedCategories.length > 0 && <div className="summary-actions no-print"><button className="primary-button" type="button" onClick={onShare}>Compartir</button><div className="secondary-actions"><button type="button" onClick={onCopy}>Copiar</button><button type="button" onClick={onPrint}>Imprimir</button></div></div>}
        <button className="clear-button no-print" type="button" onClick={onClear}>Lista nueva</button>
      </main>
    </div>
  )
}
