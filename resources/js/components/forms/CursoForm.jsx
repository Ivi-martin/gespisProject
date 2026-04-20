import { useState, useEffect } from 'react';
import { FormField, FormCard } from './FormComponents';

// Equivalente a PanelNuevoCurso.java + PanelEliminarCurso.java + la lógica de CursosDB.java
// La comunicación con MySQL ya no es JDBC directo: va por la API REST de Laravel.

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const INITIAL_STATE = {
  codigo:      '',
  nombrec:     '',
  dias:        [],       // Array en lugar de String libre — mejora UX
  hora:        '',
  aforomax:    '',
  monitor_dni: '',
};

const INITIAL_ERRORS = {
  codigo: '', nombrec: '', dias: '', hora: '', aforomax: '', monitor_dni: '',
};

export default function CursoForm() {
  const [form,      setForm]      = useState(INITIAL_STATE);
  const [errors,    setErrors]    = useState(INITIAL_ERRORS);
  const [monitores, setMonitores] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState('');
  const [apiError,  setApiError]  = useState('');

  // Carga la lista de monitores para el <select>
  // Equivale al combo de monitores de PanelNuevoCurso.java
  useEffect(() => {
    fetch('/api/monitores')
      .then(r => r.json())
      .then(data => setMonitores(data))
      .catch(() => {/* en desarrollo puede estar vacío */});
  }, []);

  // ── Validación del lado del cliente ────────────────────────────
  // Equivale a las comprobaciones antes de llamar a CursosDB.insertarCurso()
  function validate() {
    const e = { ...INITIAL_ERRORS };
    let ok = true;

    if (!form.codigo.trim()) {
      e.codigo = 'El código del curso es obligatorio.'; ok = false;
    } else if (!/^[A-Z0-9\-]{2,20}$/i.test(form.codigo)) {
      e.codigo = 'Solo letras, números y guiones (máx. 20 caracteres).'; ok = false;
    }

    if (!form.nombrec.trim()) {
      e.nombrec = 'El nombre del curso es obligatorio.'; ok = false;
    }

    if (form.dias.length === 0) {
      e.dias = 'Selecciona al menos un día.'; ok = false;
    }

    if (!form.hora.trim()) {
      e.hora = 'La hora es obligatoria.'; ok = false;
    }

    const aforo = parseInt(form.aforomax, 10);
    if (!form.aforomax || isNaN(aforo) || aforo < 1) {
      e.aforomax = 'El aforo debe ser un número mayor que 0.'; ok = false;
    } else if (aforo > 100) {
      e.aforomax = 'El aforo máximo es 100.'; ok = false;
    }

    setErrors(e);
    return ok;
  }

  // ── Manejo de cambios ──────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setSuccess('');
    setApiError('');
  }

  // Checkboxes de días (en el Java era un JTextField libre)
  function handleDiaToggle(dia) {
    setForm(prev => ({
      ...prev,
      dias: prev.dias.includes(dia)
        ? prev.dias.filter(d => d !== dia)
        : [...prev.dias, dia],
    }));
    if (errors.dias) setErrors(prev => ({ ...prev, dias: '' }));
  }

  // ── Envío del formulario ───────────────────────────────────────
  // Equivale a CursosDB.insertarCurso() pero vía API REST
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      const response = await fetch('/api/cursos', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept':        'application/json',
          // En producción aquí irá: 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          dias: form.dias.join(', '),   // se guarda como string, igual que en el Java
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Curso "${form.nombrec}" creado correctamente.`);
        setForm(INITIAL_STATE);
        setErrors(INITIAL_ERRORS);
      } else {
        // Laravel devuelve errores de validación en data.errors
        if (data.errors) {
          const laravelErrors = {};
          Object.entries(data.errors).forEach(([k, v]) => {
            laravelErrors[k] = Array.isArray(v) ? v[0] : v;
          });
          setErrors(prev => ({ ...prev, ...laravelErrors }));
        } else {
          setApiError(data.message || 'Error al guardar el curso.');
        }
      }
    } catch {
      setApiError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormCard
      title="Nuevo Curso"
      subtitle="Rellena los datos del curso a crear"
      onSubmit={handleSubmit}
      loading={loading}
      success={success}
      error={apiError}
    >
      {/* Fila 1: Código + Nombre */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Código"
          name="codigo"
          value={form.codigo}
          onChange={handleChange}
          error={errors.codigo}
          placeholder="ej: NAT-A1"
          required
        />
        <FormField
          label="Nombre del curso"
          name="nombrec"
          value={form.nombrec}
          onChange={handleChange}
          error={errors.nombrec}
          placeholder="ej: Natación nivel iniciación"
          required
        />
      </div>

      {/* Días de la semana — checkboxes en lugar del TextField libre del Java */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Días <span className="text-red-400">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mt-1">
          {DIAS_SEMANA.map(dia => (
            <button
              key={dia}
              type="button"
              onClick={() => handleDiaToggle(dia)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
                ${form.dias.includes(dia)
                  ? 'bg-cyan-600 border-cyan-600 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-cyan-400'
                }`}
            >
              {dia}
            </button>
          ))}
        </div>
        {errors.dias && (
          <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
            <span>⚠</span> {errors.dias}
          </p>
        )}
        {form.dias.length > 0 && (
          <p className="text-xs text-cyan-600 mt-1">
            Seleccionados: {form.dias.join(', ')}
          </p>
        )}
      </div>

      {/* Fila 3: Hora + Aforo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Hora"
          name="hora"
          value={form.hora}
          onChange={handleChange}
          error={errors.hora}
          placeholder="ej: 09:00 - 10:00"
          required
        />
        <FormField
          label="Aforo máximo"
          name="aforomax"
          type="number"
          value={form.aforomax}
          onChange={handleChange}
          error={errors.aforomax}
          placeholder="ej: 20"
          required
        />
      </div>

      {/* Monitor asignado — equivale al combo de monitores del Java */}
      <FormField
        label="Monitor asignado"
        name="monitor_dni"
        value={form.monitor_dni}
        onChange={handleChange}
        error={errors.monitor_dni}
      >
        <option value="">— Sin monitor asignado —</option>
        {monitores.map(m => (
          <option key={m.dni} value={m.dni}>
            {m.nombre} {m.apellido1} ({m.dni})
          </option>
        ))}
      </FormField>
    </FormCard>
  );
}
