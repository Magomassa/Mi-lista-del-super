export default function SearchBar({ value, onChange }) {
  return (
    <label className="search-bar">
      <span aria-hidden="true">⌕</span><span className="sr-only">Buscar productos</span>
      <input type="search" aria-label="Buscar productos" placeholder="Buscar un producto..." value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}
