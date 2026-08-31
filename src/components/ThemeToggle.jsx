export default function ThemeToggle({ theme, onToggle }) {
  const dark = theme === 'dark'
  return (
    <button className="theme-toggle" type="button" aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'} onClick={onToggle}>
      <span aria-hidden="true">{dark ? '☀️' : '🌙'}</span>
    </button>
  )
}
