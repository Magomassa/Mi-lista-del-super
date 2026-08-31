import ProductRow from './ProductRow'

export default function CategorySection({ category, list, allSelected, onToggleAll, onToggle, onQuantity, onUpdate }) {
  return (
    <section className="category-section" aria-labelledby={`category-${category.id}`}>
      <div className="category-heading"><h2 id={`category-${category.id}`}>{category.name}</h2><button className="category-action" type="button" aria-label={`${allSelected ? 'Deseleccionar' : 'Seleccionar'} todos en ${category.name}`} onClick={onToggleAll}>{allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}</button></div>
      <div className="category-products">
        {category.products.map((product) => <ProductRow key={product.id} product={product} entry={list[product.id]} onToggle={() => onToggle(product)} onQuantity={(delta) => onQuantity(product.id, delta)} onUpdate={(patch) => onUpdate(product.id, patch)} />)}
      </div>
    </section>
  )
}
