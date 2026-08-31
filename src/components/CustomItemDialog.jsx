import { useState } from 'react'

export default function CustomItemDialog({ item, onCancel, onSave }) {
  const [name, setName] = useState(item?.name ?? '')
  const editing = Boolean(item)
  function submit(event) {
    event.preventDefault()
    if (name.trim()) onSave(name.trim())
  }
  return (
    <div className="dialog-backdrop">
      <form className="save-dialog" role="dialog" aria-modal="true" aria-labelledby="custom-dialog-title" onSubmit={submit}>
        <h2 id="custom-dialog-title">{editing ? 'Editar artículo' : 'Agregar artículo'}</h2>
        <label><span>Nombre del artículo</span><input autoFocus type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej: Tostadora" /></label>
        <div className="dialog-actions"><button type="button" onClick={onCancel}>Cancelar</button><button className="primary-button" type="submit" disabled={!name.trim()}>{editing ? 'Guardar cambios' : 'Agregar'}</button></div>
      </form>
    </div>
  )
}
