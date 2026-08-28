import { useEffect, useMemo, useState } from 'react'
import { categories } from './data/catalog'
import { changeQuantity, toggleProduct, updateProduct } from './lib/listState'
import { formatList } from './lib/formatList'
import { deleteTemplate, loadDraft, loadLastPurchase, loadTemplates, saveDraft, saveLastPurchase, saveTemplate, updateTemplate } from './lib/storage'
import SearchBar from './components/SearchBar'
import CategorySection from './components/CategorySection'
import Summary from './components/Summary'
import SavedLists from './components/SavedLists'
import SaveTemplateDialog from './components/SaveTemplateDialog'

const clone = (value) => JSON.parse(JSON.stringify(value))
const hasSelections = (list) => Object.values(list).some((item) => item?.selected)

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
  const [list, setList] = useState(loadDraft)
  const [templates, setTemplates] = useState(loadTemplates)
  const [lastPurchase, setLastPurchase] = useState(loadLastPurchase)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('products')
  const [message, setMessage] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  useEffect(() => saveDraft(list), [list])

  const selectedCount = Object.values(list).filter((item) => item?.selected).length
  const normalizedSearch = search.trim().toLocaleLowerCase('es-AR')
  const visibleCategories = useMemo(() => categories.flatMap((category) => {
    const products = category.products.filter((product) => product.name.toLocaleLowerCase('es-AR').includes(normalizedSearch))
    return products.length ? [{ ...category, products }] : []
  }), [normalizedSearch])
  const text = formatList(categories, list)

  function rememberPurchase() {
    const snapshot = clone(list)
    saveLastPurchase(snapshot)
    setLastPurchase(snapshot)
  }

  async function handleCopy() {
    rememberPurchase()
    try {
      await copyWithFallback(text)
      setMessage('Lista copiada')
    } catch {
      setMessage('No se pudo copiar la lista')
    }
  }

  async function handleShare() {
    rememberPurchase()
    if (!navigator.share) {
      try {
        await copyWithFallback(text)
        setMessage('Tu navegador no permite compartir. La lista fue copiada.')
      } catch {
        setMessage('No se pudo compartir la lista')
      }
      return
    }
    try {
      await navigator.share({ title: 'Lista del Súper', text })
    } catch (error) {
      if (error?.name !== 'AbortError') setMessage('No se pudo compartir la lista')
    }
  }

  function handlePrint() {
    rememberPurchase()
    window.print()
  }

  function handleClear() {
    if (!window.confirm('¿Querés limpiar esta lista y comenzar una nueva?')) return
    setList({})
    setMessage('Lista limpia')
  }

  function handleLoad(snapshot) {
    if (hasSelections(list) && !window.confirm('La lista actual tiene productos. ¿Querés reemplazarla?')) return
    setList(clone(snapshot))
    setMessage('Lista cargada')
    setView('products')
  }

  function handleSaveTemplate(name) {
    saveTemplate(name, list)
    setTemplates(loadTemplates())
    setShowSaveDialog(false)
    setMessage('Lista guardada')
  }

  function handleUpdateTemplate(template) {
    if (!window.confirm(`¿Querés sobrescribir “${template.name}” con la selección actual?`)) return
    updateTemplate(template.id, list)
    setTemplates(loadTemplates())
    setMessage('Lista guardada actualizada')
  }

  function handleDeleteTemplate(template) {
    if (!window.confirm(`¿Querés eliminar “${template.name}”?`)) return
    deleteTemplate(template.id)
    setTemplates(loadTemplates())
    setMessage('Lista guardada eliminada')
  }

  if (view === 'summary') {
    return <Summary categories={categories} list={list} message={message} onBack={() => setView('products')} onCopy={handleCopy} onShare={handleShare} onPrint={handlePrint} onClear={handleClear} />
  }

  if (view === 'saved') {
    return <><SavedLists lastPurchase={lastPurchase} templates={templates} canSave={selectedCount > 0} onBack={() => setView('products')} onLoad={handleLoad} onSave={() => setShowSaveDialog(true)} onUpdate={handleUpdateTemplate} onDelete={handleDeleteTemplate} />{showSaveDialog && <SaveTemplateDialog onCancel={() => setShowSaveDialog(false)} onSave={handleSaveTemplate} />}</>
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true">✓</div>
        <div className="brand-copy"><h1>Lista del Súper</h1><p>¿Qué hace falta comprar?</p></div>
        <button className="saved-lists-entry" type="button" onClick={() => setView('saved')}>Listas guardadas</button>
      </header>
      <main className="products-view">
        <SearchBar value={search} onChange={setSearch} />
        <div className="helper-row"><span>Elegí los productos</span>{selectedCount > 0 && <strong>{selectedCount} seleccionados</strong>}</div>
        {visibleCategories.map((category) => <CategorySection key={category.id} category={category} list={list} onToggle={(product) => setList((current) => toggleProduct(current, product))} onQuantity={(id, delta) => setList((current) => changeQuantity(current, id, delta))} onUpdate={(id, patch) => setList((current) => updateProduct(current, id, patch))} />)}
        {!visibleCategories.length && <p className="empty-state">No encontramos productos con ese nombre.</p>}
      </main>
      <div className="bottom-action"><button className="primary-button" type="button" disabled={!selectedCount} onClick={() => setView('summary')}>Ver lista ({selectedCount})</button></div>
    </div>
  )
}
