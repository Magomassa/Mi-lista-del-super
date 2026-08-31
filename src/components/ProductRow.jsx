export default function ProductRow({ product, entry, onToggle, onQuantity, onUpdate, onEdit, onDelete }) {
  const selected = Boolean(entry?.selected)
  return (
    <article className={`product-row ${selected ? 'is-selected' : ''}`} data-testid={`product-${product.id}`}>
      <label className="product-choice">
        <input type="checkbox" checked={selected} onChange={onToggle} />
        <span className="custom-checkbox" aria-hidden="true">✓</span><span className="product-name">{product.name}</span>
      </label>
      {product.custom && <div className="custom-item-actions"><button type="button" aria-label={`Editar ${product.name}`} onClick={onEdit}>Editar</button><button type="button" aria-label={`Eliminar ${product.name}`} onClick={onDelete}>Eliminar</button></div>}
      {selected && (
        <div className="product-details">
          <div className="quantity-control"><span>Cantidad</span><div className="stepper">
            <button type="button" aria-label={`Restar ${product.name}`} onClick={() => onQuantity(-1)}>−</button>
            <input type="number" min="1" inputMode="numeric" aria-label={`Cantidad de ${product.name}`} value={entry.quantity} onChange={(event) => onUpdate({ quantity: event.target.value })} />
            <button type="button" aria-label={`Sumar ${product.name}`} onClick={() => onQuantity(1)}>+</button>
          </div></div>
          <label className="note-field"><span>Observación (opcional)</span><input type="text" aria-label={`Observación de ${product.name}`} placeholder="Ej: sin sal" value={entry.note} onChange={(event) => onUpdate({ note: event.target.value })} /></label>
        </div>
      )}
    </article>
  )
}
