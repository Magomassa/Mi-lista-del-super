import { useEffect, useMemo, useState } from 'react'
import { categories } from './data/products'
import { changeQuantity, toggleProduct, updateProduct } from './lib/listState'
import { formatList } from './lib/formatList'
import { loadList, saveList } from './lib/storage'
import SearchBar from './components/SearchBar'
import CategorySection from './components/CategorySection'
import Summary from './components/Summary'

function copyWithFallback(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text)
  const area = document.createElement('textarea')
  area.value = text
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  document.execCommand('copy')
  area.remove()
  return Promise.resolve()
}

export default function App() {
  const [list, setList] = useState(loadList)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('products')
  const [message, setMessage] = useState('')

  useEffect(() => saveList(list), [list])

  const selectedCount = Object.values(list).filter((item) => item?.selected).length
  const normalizedSearch = search.trim().toLocaleLowerCase('es-AR')
  const visibleCategories = useMemo(
    () => categories.flatMap((category) => {
      const products = category.products.filter((product) =>
        product.name.toLocaleLowerCase('es-AR').includes(normalizedSearch),
      )
      return products.length ? [{ ...category, products }] : []
    }),
    [normalizedSearch],
  )
  const text = formatList(categories, list)

  async function handleCopy() {
    try {
      await copyWithFallback(text)
      setMessage('Lista copiada')
    } catch {
      setMessage('No se pudo copiar la lista')
    }
  }

  async function handleShare() {
    if (!navigator.share) {
      await handleCopy()
      setMessage('Tu navegador no permite compartir. La lista fue copiada.')
      return
    }
    try {
      await navigator.share({ title: 'Lista del Súper', text })
    } catch (error) {
      if (error?.name !== 'AbortError') setMessage('No se pudo compartir la lista')
    }
  }

  function handleClear() {
    if (!window.confirm('¿Querés limpiar esta lista y comenzar una nueva?')) return
    setList({})
    setMessage('Lista limpia')
  }

  if (view === 'summary') {
    return <Summary categories={categories} list={list} message={message} onBack={() => setView('products')} onCopy={handleCopy} onShare={handleShare} onPrint={() => window.print()} onClear={handleClear} />
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true">✓</div>
        <div><h1>Lista del Súper</h1><p>¿Qué hace falta comprar?</p></div>
      </header>
      <main className="products-view">
        <SearchBar value={search} onChange={setSearch} />
        <div className="helper-row"><span>Elegí los productos</span>{selectedCount > 0 && <strong>{selectedCount} seleccionados</strong>}</div>
        {visibleCategories.map((category) => (
          <CategorySection key={category.id} category={category} list={list}
            onToggle={(id) => setList((current) => toggleProduct(current, id))}
            onQuantity={(id, delta) => setList((current) => changeQuantity(current, id, delta))}
            onUpdate={(id, patch) => setList((current) => updateProduct(current, id, patch))} />
        ))}
        {!visibleCategories.length && <p className="empty-state">No encontramos productos con ese nombre.</p>}
      </main>
      <div className="bottom-action">
        <button className="primary-button" type="button" disabled={!selectedCount} onClick={() => setView('summary')}>Ver lista ({selectedCount})</button>
      </div>
    </div>
  )
}
