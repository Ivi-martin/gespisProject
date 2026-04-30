/**
 * ConfirmModal — diálogo de confirmación antes de eliminar.
 * Se reutiliza en CursosBuscar, UsuariosBuscar y MonitoresBuscar.
 */
export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, loading }) {
  if (!isOpen) return null;

  return (
    /* Fondo oscuro */
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      {/* Panel del modal */}
      <div
        className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Icono */}
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-red-500 text-xl">⚠</span>
        </div>

        <h3 className="text-base font-bold text-slate-800 text-center mb-2">{title}</h3>
        <p className="text-sm text-slate-500 text-center mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm
                       font-medium text-slate-600 hover:bg-slate-50 transition-colors
                       disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600
                       text-white text-sm font-semibold transition-colors
                       disabled:bg-red-300"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Eliminando…
              </span>
            ) : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
