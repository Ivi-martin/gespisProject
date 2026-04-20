/**
 * EditModal — contenedor genérico para el formulario de edición.
 * Equivale a VentanaModificar.java / VentanaModificarMonitor.java del Java.
 * Envuelve CursoForm / MonitorForm / UsuarioForm en modo edición.
 */
export default function EditModal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-2xl my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center
                       justify-center text-slate-400 hover:text-slate-600 transition-colors
                       text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Contenido — el formulario de edición */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
