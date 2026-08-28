export default function SavedLists({ lastPurchase, templates, canSave, onBack, onLoad, onSave, onUpdate, onDelete }) {
  return (
    <div className="app-shell saved-shell">
      <header className="summary-header"><button className="back-button" type="button" onClick={onBack}>← Volver</button><strong>Listas guardadas</strong></header>
      <main className="saved-view">
        <section className="saved-intro"><h1>Listas guardadas</h1><p>Reutilizá una compra sin cambiar la lista original.</p><button className="primary-button" type="button" disabled={!canSave} onClick={onSave}>Guardar selección actual</button>{!canSave && <small>Seleccioná productos para guardar una lista.</small>}</section>
        <section className="last-purchase-card"><h2>Última compra</h2>{lastPurchase ? <><p>Última compra disponible.</p><button type="button" onClick={() => onLoad(lastPurchase)}>Cargar última compra</button></> : <p>Todavía no finalizaste ninguna compra.</p>}</section>
        <section className="templates-section"><h2>Mis listas</h2>{!templates.length && <p className="empty-saved">No hay listas guardadas todavía.</p>}<div className="template-list">{templates.map((template) => <article className="template-card" key={template.id}><strong>{template.name}</strong><button className="load-template" type="button" aria-label={`Cargar ${template.name}`} onClick={() => onLoad(template.items)}>Cargar</button><div className="template-secondary"><button type="button" aria-label={`Actualizar ${template.name}`} disabled={!canSave} onClick={() => onUpdate(template)}>Actualizar</button><button type="button" aria-label={`Eliminar ${template.name}`} onClick={() => onDelete(template)}>Eliminar</button></div></article>)}</div></section>
      </main>
    </div>
  )
}
