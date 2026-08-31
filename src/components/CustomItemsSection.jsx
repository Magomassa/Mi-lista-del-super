import ProductRow from './ProductRow'

export default function CustomItemsSection({ items, onAdd, onToggle, onQuantity, onUpdate, onEdit, onDelete }) {
  return (
    <section className="category-section custom-section" aria-labelledby="category-otros">
      <div className="category-heading"><h2 id="category-otros">Otros</h2><button className="category-action add-custom" type="button" onClick={onAdd}>+ Agregar artículo</button></div>
      {items.length > 0 && <div className="category-products">{items.map((item) => <ProductRow key={item.id} product={item} entry={item} onToggle={() => onToggle(item)} onQuantity={(delta) => onQuantity(item.id, delta)} onUpdate={(patch) => onUpdate(item.id, patch)} onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} />)}</div>}
    </section>
  )
}
