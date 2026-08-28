import { useState } from 'react'

export default function SaveTemplateDialog({ onCancel, onSave }) {
  const [name, setName] = useState('')
  function submit(event) {
    event.preventDefault()
    if (name.trim()) onSave(name.trim())
  }
  return (
    <div className="dialog-backdrop"><form className="save-dialog" role="dialog" aria-modal="true" aria-labelledby="save-dialog-title" onSubmit={submit}><h2 id="save-dialog-title">Guardar esta selección</h2><label><span>Nombre de la lista</span><input autoFocus type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej: Compra habitual" /></label><div className="dialog-actions"><button type="button" onClick={onCancel}>Cancelar</button><button className="primary-button" type="submit" disabled={!name.trim()}>Guardar</button></div></form></div>
  )
}
