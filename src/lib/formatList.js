function formatDate(date) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatList(categories, state, date = new Date()) {
  const sections = categories.flatMap((category) => {
    const items = category.products.flatMap((product) => {
      const entry = state[product.id]
      if (!entry?.selected) return []
      const note = entry.note?.trim() ? ` (${entry.note.trim()})` : ''
      return [`• ${product.name} — ${entry.quantity}${note}`]
    })
    if (!items.length) return []
    return [`${category.name.toLocaleUpperCase('es-AR')}\n${items.join('\n')}`]
  })

  return [`LISTA DEL SÚPER — ${formatDate(date)}`, ...sections].join('\n\n')
}
