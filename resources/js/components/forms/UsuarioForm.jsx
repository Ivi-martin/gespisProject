import { useState } from 'react';
import { FormField, FormCard } from './FormComponents';

// Equivalente a PanelNuevoUsuario.java + MetUsuarios.java + UsuariosDB.java
// PanelNuevoUsuario era el más largo del proyecto Java (10.000 bytes), así que
// aquí separamos bien las secciones con <fieldset>.

const INITIAL_STATE = {
  dni:              '',
  nombre:           '',
  apellido1:        '',
  apellido2:        '',
  fecha_nacimiento: '',
  direccion:        '',
  telefono:         '',
  municipio:        '',
};

const INITIAL_ERRORS = Object.fromEntries(Object.keys(INITIAL_STATE).map(k => [k, '']));

function validarDNI(dni) {
  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const regex  = /^[0-9]{8}[A-Z]$/i;
  if (!regex.test(dni)) return false;
  const letra = letras[parseInt(dni.slice(0, 8), 10) % 23];
  return letra === dni[8].toUpperCase();
}

export default function UsuarioForm() {
  const [form,     setForm]     = useState(INITIAL_STATE);
  const [errors,   setErrors]   = useState(INITIAL_ERRORS);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState('');
  const [apiError, setApiError] = useState('');

  // ── Validación ─────────────────────────────────────────────────
  function validate() {
    const e = { ...INITIAL_ERRORS };
    let ok = true;

    if (!form.dni.trim()) {
      e.dni = 'El DNI es obligatorio.'; ok = false;
    } else if (!validarDNI(form.dni)) {
      e.dni = 'DNI no válido (8 números + letra correcta).'; ok = false;
    }

    if (!form.nombre.trim()) {
      e.nombre = 'El nombre es obligatorio.'; ok = false;
    }

    if (!form.apellido1.trim()) {
      e.apellido1 = 'El primer apellido es obligatorio.'; ok = false;
    }

    if (form.telefono && !/^[6789]\d{8}$/.test(form.telefono)) {
      e.telefono = 'Teléfono no válido (9 dígitos, empieza por 6, 7, 8 o 9).'; ok = false;
    }

    // Para usuarios (alumnos) no hay restricción de edad mínima
    if (form.fecha_nacimiento) {
      const hoy = new Date();
      const nac = new Date(form.fecha_nacimiento);
      if (nac > hoy) {
        e.fecha_nacimiento = 'La fecha de nacimiento no puede ser futura.'; ok = false;
      }
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

  // ── Envío — llama a POST /api/usuarios ────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      const response = await fetch('/api/usuarios', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept':        'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Usuario ${form.nombre} ${form.apellido1} registrado correctamente.`);
        setForm(INITIAL_STATE);
        setErrors(INITIAL_ERRORS);
      } else {
        if (data.errors) {
          const laravelErrors = {};
          Object.entries(data.errors).forEach(([k, v]) => {
            laravelErrors[k] = Array.isArray(v) ? v[0] : v;
          });
          setErrors(prev => ({ ...prev, ...laravelErrors }));
        } else {
          setApiError(data.message || 'Error al registrar el usuario.');
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
      title="Nuevo Usuario"
      subtitle="Datos del miembro / alumno de la piscina"
      onSubmit={handleSubmit}
      loading={loading}
      success={success}
      error={apiError}
    >
      {/* Sección: Identificación */}
      <fieldset className="border border-slate-100 rounded-xl p-4 flex flex-col gap-4">
        <legend className="text-xs font-bold text-cyan-600 uppercase tracking-widest px-1">
          Identificación
        </legend>

        <FormField
          label="DNI"
          name="dni"
          value={form.dni}
          onChange={handleChange}
          error={errors.dni}
          placeholder="ej: 87654321B"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            error={errors.nombre}
            placeholder="Nombre"
            required
          />
          <FormField
            label="Primer apellido"
            name="apellido1"
            value={form.apellido1}
            onChange={handleChange}
            error={errors.apellido1}
            placeholder="Apellido 1"
            required
          />
          <FormField
            label="Segundo apellido"
            name="apellido2"
            value={form.apellido2}
            onChange={handleChange}
            error={errors.apellido2}
            placeholder="Apellido 2"
          />
        </div>

        <FormField
          label="Fecha de nacimiento"
          name="fecha_nacimiento"
          type="date"
          value={form.fecha_nacimiento}
          onChange={handleChange}
          error={errors.fecha_nacimiento}
        />
      </fieldset>

      {/* Sección: Localización y contacto */}
      <fieldset className="border border-slate-100 rounded-xl p-4 flex flex-col gap-4">
        <legend className="text-xs font-bold text-cyan-600 uppercase tracking-widest px-1">
          Localización y contacto
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Municipio"
            name="municipio"
            value={form.municipio}
            onChange={handleChange}
            error={errors.municipio}
            placeholder="ej: Granada"
          />
          <FormField
            label="Teléfono"
            name="telefono"
            type="tel"
            value={form.telefono}
            onChange={handleChange}
            error={errors.telefono}
            placeholder="ej: 612345678"
          />
        </div>

        <FormField
          label="Dirección"
          name="direccion"
          value={form.direccion}
          onChange={handleChange}
          error={errors.direccion}
          placeholder="Calle, número, piso…"
        />
      </fieldset>
    </FormCard>
  );
}
