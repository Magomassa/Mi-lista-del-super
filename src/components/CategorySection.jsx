import ProductRow from './ProductRow'

export default function CategorySection({ category, list, onToggle, onQuantity, onUpdate }) {
  return (
    <section className="category-section" aria-labelledby={`category-${category.id}`}>
      <h2 id={`category-${category.id}`}>{category.name}</h2>
      <div className="category-products">
        {category.products.map((product) => <ProductRow key={product.id} product={product} entry={list[product.id]} onToggle={() => onToggle(product)} onQuantity={(delta) => onQuantity(product.id, delta)} onUpdate={(patch) => onUpdate(product.id, patch)} />)}
      </div>
    </section>
  )
}
