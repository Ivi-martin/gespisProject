import { useState } from 'react';
import SearchList   from '../../components/SearchList';
import ConfirmModal from '../../components/ConfirmModal';
import EditModal    from '../../components/EditModal';

const COLUMNS = [
  { key: 'dni',      label: 'DNI' },
  {
    key: 'nombre',
    label: 'Nombre completo',
    render: item => `${item.nombre} ${item.apellido1}${item.apellido2 ? ' ' + item.apellido2 : ''}`,
  },
  { key: 'email',    label: 'Email',
    render: item => item.email || <span className="text-slate-300 italic text-xs">—</span> },
  { key: 'telefono', label: 'Teléfono',
    render: item => item.telefono || <span className="text-slate-300 italic text-xs">—</span> },
  {
    key: 'cursos_principales_count',
    label: 'Cursos',
    render: item => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                        ${item.cursos_principales_count > 0
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-slate-100 text-slate-400'}`}>
        {item.cursos_principales_count ?? 0}
      </span>
    ),
  },
];

export default function MonitoresBuscar() {
  const [toDelete, setToDelete] = useState(null);
  const [toEdit,   setToEdit]   = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [listKey,  setListKey]  = useState(0);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res  = await fetch(`/api/monitores/${toDelete.dni}`, {
        method:  'DELETE',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al eliminar.');
      setFeedback(data.message);
      setListKey(k => k + 1);
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
          <h2 className="text-white text-xl font-bold">Buscar Monitores</h2>
          <p className="text-cyan-100 text-sm mt-0.5">
            Busca por DNI, nombre o apellido · edita o elimina desde la tabla
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
            endpoint="monitores"
            columns={COLUMNS}
            searchPlaceholder="Buscar por DNI, nombre o apellido…"
            emptyText="No hay monitores que coincidan con tu búsqueda."
            onEdit={setToEdit}
            onDelete={setToDelete}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={!!toDelete}
        title="¿Eliminar este monitor?"
        message={toDelete
          ? `Se eliminará a "${toDelete.nombre} ${toDelete.apellido1}" (${toDelete.dni}). Sus cursos quedarán sin monitor asignado.`
          : ''}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />

      <EditModal
        isOpen={!!toEdit}
        title={`Editar monitor: ${toEdit?.dni ?? ''}`}
        onClose={() => setToEdit(null)}
      >
        {toEdit && (
          <MonitorFormEdit
            monitor={toEdit}
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

function MonitorFormEdit({ monitor, onSuccess, onCancel }) {
  const [form,     setForm]     = useState({
    nombre:           monitor.nombre,
    apellido1:        monitor.apellido1,
    apellido2:        monitor.apellido2 ?? '',
    fecha_nacimiento: monitor.fecha_nacimiento ?? '',
    direccion:        monitor.direccion ?? '',
    telefono:         monitor.telefono ?? '',
    email:            monitor.email ?? '',
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
      const res  = await fetch(`/api/monitores/${monitor.dni}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar.');
      onSuccess(`Monitor "${form.nombre} ${form.apellido1}" actualizado correctamente.`);
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
      <div className="grid grid-cols-3 gap-3">
        {field('Nombre', 'nombre')}
        {field('Apellido 1', 'apellido1')}
        {field('Apellido 2', 'apellido2')}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {field('Fecha nacimiento', 'fecha_nacimiento', 'date')}
        {field('Teléfono', 'telefono', 'tel')}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {field('Email', 'email', 'email')}
        {field('Dirección', 'direccion')}
      </div>
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
