/**
 * FormField — componente reutilizable para cada campo del formulario.
 * Evita repetir el mismo patrón de label + input + mensaje de error
 * en CursoForm, MonitorForm y UsuarioForm.
 */
export function FormField({ label, name, type = 'text', value, onChange, error, required, placeholder, children }) {
  const baseInput = `w-full rounded-xl border px-4 py-2.5 text-sm text-slate-800
    outline-none transition-all duration-150
    focus:ring-2 focus:ring-cyan-400 focus:border-transparent
    ${error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white hover:border-cyan-300'}`;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children ? (
        <select name={name} value={value} onChange={onChange} className={baseInput}>
          {children}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseInput}
        />
      )}
      {error && (
        <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

/**
 * FormCard — contenedor visual para cada formulario.
 * Equivale al JPanel central con su título.
 */
export function FormCard({ title, subtitle, onSubmit, children, loading, success, error }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

      {/* Cabecera con franja de color */}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 py-5">
        <h2 className="text-white text-xl font-bold">{title}</h2>
        {subtitle && <p className="text-cyan-100 text-sm mt-0.5">{subtitle}</p>}
      </div>

      <form onSubmit={onSubmit} className="p-6 flex flex-col gap-5">

        {/* Mensajes de estado (equivale a los JOptionPane del Java) */}
        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <span className="text-emerald-500 text-lg">✓</span>
            <p className="text-emerald-700 text-sm font-medium">{success}</p>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <span className="text-red-400 text-lg">✕</span>
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {children}

        {/* Botón de submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-cyan-600 hover:bg-cyan-700
                     disabled:bg-cyan-300 text-white font-semibold py-3
                     transition-colors duration-150 text-sm tracking-wide shadow-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Guardando…
            </span>
          ) : 'Guardar'}
        </button>
      </form>
    </div>
  );
}
