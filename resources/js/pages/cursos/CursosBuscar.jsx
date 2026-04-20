import { useState } from 'react';
import SearchList   from '../../components/SearchList';
import ConfirmModal from '../../components/ConfirmModal';
import EditModal    from '../../components/EditModal';
import CursoForm    from '../../components/forms/CursoForm';
import { FormCard } from '../../components/forms/FormComponents';

// Equivale a PanelBuscarCurso.java + PanelEliminarCurso.java del proyecto Java,
// ahora unificados en una sola vista con acciones inline en la tabla.

const COLUMNS = [
  { key: 'codigo',  label: 'Código' },
  { key: 'nombrec', label: 'Nombre' },
  { key: 'dias',    label: 'Días' },
  { key: 'hora',    label: 'Hora' },
  {
    key: 'aforomax',
    label: 'Plazas',
    render: item => (
      <span className="flex items-center gap-1">
        <span className="font-medium text-slate-800">{item.usuarios_count ?? 0}</span>
        <span className="text-slate-400">/</span>
        <span className="text-slate-500">{item.aforomax}</span>
      </span>
    ),
  },
  {
    key: 'monitor_dni',
    label: 'Monitor',
    render: item => item.monitor
      ? `${item.monitor.nombre} ${item.monitor.apellido1}`
      : <span className="text-slate-300 italic text-xs">Sin asignar</span>,
  },
];

export default function CursosBuscar() {
  const [toDelete,  setToDelete]  = useState(null);
  const [toEdit,    setToEdit]    = useState(null);
  const [deleting,  setDeleting]  = useState(false);
  const [feedback,  setFeedback]  = useState('');
  // Clave para forzar re-render de SearchList tras un cambio
  const [listKey,   setListKey]   = useState(0);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res  = await fetch(`/api/cursos/${toDelete.codigo}`, {
        method:  'DELETE',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al eliminar.');
      setFeedback(data.message);
      setListKey(k => k + 1);   // recarga la lista
    } catch (e) {
      setFeedback(`Error: ${e.message}`);
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 py-5">
          <h2 className="text-white text-xl font-bold">Buscar Cursos</h2>
          <p className="text-cyan-100 text-sm mt-0.5">
            Busca por código o nombre · edita o elimina desde la tabla
          </p>
        </div>

        <div className="p-6">
          {feedback && (
            <div className={`flex items-center gap-2 rounded-xl px-4 py-3 mb-4 text-sm font-medium
                            ${feedback.startsWith('Error')
                              ? 'bg-red-50 border border-red-200 text-red-700'
                              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
              <span>{feedback.startsWith('Error') ? '✕' : '✓'}</span>
              {feedback}
            </div>
          )}

          <SearchList
            key={listKey}
            endpoint="cursos"
            columns={COLUMNS}
            searchPlaceholder="Buscar por código o nombre del curso…"
            emptyText="No hay cursos que coincidan con tu búsqueda."
            onEdit={setToEdit}
            onDelete={setToDelete}
          />
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={!!toDelete}
        title="¿Eliminar este curso?"
        message={toDelete
          ? `Se eliminará "${toDelete.nombrec}" (${toDelete.codigo}) y todas sus inscripciones. Esta acción no se puede deshacer.`
          : ''}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />

      {/* Modal de edición — reutiliza CursoForm en modo edición */}
      <EditModal
        isOpen={!!toEdit}
        title={`Editar curso: ${toEdit?.codigo ?? ''}`}
        onClose={() => setToEdit(null)}
      >
        {toEdit && (
          <CursoFormEdit
            curso={toEdit}
            onSuccess={(msg) => {
              setFeedback(msg);
              setToEdit(null);
              setListKey(k => k + 1);
            }}
            onCancel={() => setToEdit(null)}
          />
        )}
      </EditModal>
    </>
  );
}

// ── Formulario de edición inline (PUT /api/cursos/{codigo}) ───────────────
// Versión reducida de CursoForm pre-rellena con los datos del curso.
function CursoFormEdit({ curso, onSuccess, onCancel }) {
  const [form,     setForm]     = useState({
    codigo:      curso.codigo,
    nombrec:     curso.nombrec,
    dias:        curso.dias,
    hora:        curso.hora,
    aforomax:    String(curso.aforomax),
    monitor_dni: curso.monitor_dni ?? '',
  });
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setApiError('');
    try {
      const res  = await fetch(`/api/cursos/${curso.codigo}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body:    JSON.stringify({ ...form, aforomax: parseInt(form.aforomax, 10) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar.');
      onSuccess(`Curso "${form.nombrec}" actualizado correctamente.`);
    } catch (e) {
      setApiError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const field = (label, name, type = 'text') => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <input type={type} name={name} value={form[name]} onChange={handleChange}
             className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none
                        focus:ring-2 focus:ring-cyan-400 focus:border-transparent" />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
          {apiError}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {field('Código', 'codigo')}
        {field('Nombre', 'nombrec')}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {field('Días', 'dias')}
        {field('Hora', 'hora')}
      </div>
      {field('Aforo máximo', 'aforomax', 'number')}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm
                           text-slate-600 hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700
                           text-white text-sm font-semibold transition-colors disabled:bg-cyan-300">
          {loading ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}
