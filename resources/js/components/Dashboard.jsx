import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Datos mock por rol ─────────────────────────────────────────────────────
// Cuando integres la autenticación, estos vendrán del backend (GET /api/dashboard)
// y se filtrarán según el rol del usuario logueado.

const MOCK_DATA = {
  admin: {
    stats: [
      { label: 'Cursos activos',     value: 12,  sub: '+2 este mes',    color: 'cyan'   },
      { label: 'Usuarios inscritos', value: 148, sub: '6 nuevos hoy',   color: 'emerald'},
      { label: 'Monitores',          value: 8,   sub: 'todos activos',  color: 'violet' },
      { label: 'Plazas disponibles', value: 34,  sub: 'en todos los cursos', color: 'amber'},
    ],
    accesos: [
      { label: 'Nuevo curso',       icon: 'cur.png', to: '/cursos/nuevo'       },
      { label: 'Nuevo usuario',     icon: 'usu.png', to: '/usuarios/nuevo'     },
      { label: 'Nuevo monitor',     icon: 'moni.png', to: '/monitores/nuevo'    },
      { label: 'Buscar curso',      icon: 'buscar-curso.png', to: '/cursos/buscar'      },
      { label: 'Buscar usuario',    icon: 'buscar-usuario.png', to: '/usuarios/buscar'    },
      { label: 'Buscar monitor',    icon: 'buscar-Monitor.png', to: '/monitores/buscar'   },
    ],
    actividad: [
      { tipo: 'inscripcion', texto: 'Juan Miguel García inscrito en Natación A2',    hora: 'hace 5 min' },
      { tipo: 'nuevo',       texto: 'Nuevo curso "Aquagym avanzado" creado',   hora: 'hace 1 h'   },
      { tipo: 'baja',        texto: 'Jose Carlos Alfaro dado de baja en Waterpolo',    hora: 'hace 2 h'   },
      { tipo: 'nuevo',       texto: 'Monitor Jose Luis Jiménez registrado',           hora: 'hace 3 h'   },
      { tipo: 'inscripcion', texto: 'Miguel Díaz inscrito en Natación infantil',hora: 'ayer'       },
    ],
  },

  monitor: {
    stats: [
      { label: 'Mis cursos',          value: 3,  sub: 'asignados',       color: 'cyan'   },
      { label: 'Alumnos totales',     value: 42, sub: 'en mis cursos',   color: 'emerald'},
      { label: 'Horas esta semana',   value: 9,  sub: 'Lun · Mié · Vie', color: 'violet' },
      { label: 'Plazas libres',       value: 6,  sub: 'entre mis cursos',color: 'amber'  },
    ],
    accesos: [
      { label: 'Mis cursos',          icon: '📋', to: '/cursos/buscar'   },
      { label: 'Buscar alumno',       icon: '🔍', to: '/usuarios/buscar' },
    ],
    actividad: [
      { tipo: 'inscripcion', texto: 'Carlos Vega inscrito en tu curso Natación B2', hora: 'hace 20 min' },
      { tipo: 'baja',        texto: 'Laura Sánchez se ha dado de baja en Aquagym', hora: 'hace 4 h'    },
      { tipo: 'inscripcion', texto: 'Nuevo alumno en Natación infantil',            hora: 'ayer'        },
    ],
  },

  usuario: {
    stats: [
      { label: 'Cursos inscritos', value: 2,  sub: 'activos',         color: 'cyan'   },
      { label: 'Horas / semana',   value: 4,  sub: 'de actividad',    color: 'emerald'},
      { label: 'Plazas libres',    value: 12, sub: 'en cursos disponibles', color: 'violet'},
    ],
    accesos: [
      { label: 'Ver cursos disponibles', icon: '🔍', to: '/cursos/buscar'  },
      { label: 'Mis inscripciones',      icon: '📋', to: '/usuarios/buscar'},
    ],
    actividad: [
      { tipo: 'inscripcion', texto: 'Te inscribiste en Aquagym mañanero', hora: 'hace 2 días' },
      { tipo: 'nuevo',       texto: 'Nuevo curso de Natación disponible', hora: 'hace 3 días' },
    ],
  },
};

const COLOR_MAP = {
  cyan:    { bg: 'bg-cyan-50',    text: 'text-cyan-700',    dot: 'bg-cyan-500'    },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-500'  },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
};

const ACTIVIDAD_ICON = {
  inscripcion: { emoji: '✓', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  nuevo:       { emoji: '+', bg: 'bg-cyan-100',    text: 'text-cyan-700'    },
  baja:        { emoji: '−', bg: 'bg-red-100',     text: 'text-red-600'     },
};

const ROL_LABEL = {
  admin:   { label: 'Administrador', color: 'bg-violet-100 text-violet-700' },
  monitor: { label: 'Monitor',       color: 'bg-cyan-100 text-cyan-700'     },
  usuario: { label: 'Usuario',       color: 'bg-emerald-100 text-emerald-700'},
};

// ── Componente principal ───────────────────────────────────────────────────
export default function Dashboard({ rol = 'admin', nombreUsuario = 'Administrador' }) {
  const navigate = useNavigate();
  const data     = MOCK_DATA[rol];
  const rolInfo  = ROL_LABEL[rol];

  return (
    <div className="flex flex-col gap-6">

      {/* ── Cabecera ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Hola, {nombreUsuario}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        {/* Badge de rol — cuando haya login, vendrá del contexto de autenticación */}
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${rolInfo.color}`}>
          {rolInfo.label}
        </span>
      </div>

      {/* ── Tarjetas de estadísticas ──────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.stats.map((stat) => {
          const c = COLOR_MAP[stat.color];
          return (
            <div
              key={stat.label}
              className={`${c.bg} rounded-2xl p-5 flex flex-col gap-1`}
            >
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <span className={`text-3xl font-bold ${c.text}`}>
                {stat.value}
              </span>
              <span className="text-xs text-slate-400">{stat.sub}</span>
            </div>
          );
        })}
      </div>

      {/* ── Accesos rápidos + Actividad reciente ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Accesos rápidos (equivale al menú lateral del Java) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
            Accesos rápidos
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {data.accesos.map((acc) => (
              <button
                key={acc.to}
                onClick={() => navigate(acc.to)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl
                           border border-slate-100 hover:border-cyan-300
                           hover:bg-cyan-50 transition-all duration-150 text-center"
              >
                <img 
                  src={`/images/icons/${acc.icon}`} 
                  alt={acc.label}
                  className="w-10 h-10 object-contain transition-transform group-hover:scale-110" 
                />
                <span className="text-xs font-medium text-slate-600 leading-tight">
                  {acc.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
            Actividad reciente
          </h2>
          <ul className="flex flex-col gap-3">
            {data.actividad.map((item, i) => {
              const ic = ACTIVIDAD_ICON[item.tipo];
              return (
                <li key={i} className="flex items-start gap-3">
                  <span className={`shrink-0 mt-0.5 w-5 h-5 rounded-full text-xs font-bold
                                    flex items-center justify-center ${ic.bg} ${ic.text}`}>
                    {ic.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 leading-snug">{item.texto}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.hora}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ── Selector de rol (solo para desarrollo, se quita al integrar login) ── */}
      <RolSwitcher rolActual={rol} />
    </div>
  );
}

// ── Selector temporal de rol (SOLO PARA DESARROLLO) ───────────────────────
// Simula el cambio de rol sin tener login. Cuando implementes auth con Laravel
// Sanctum, este componente desaparece y el rol vendrá del contexto de usuario.
function RolSwitcher({ rolActual }) {
  return (
    <div className="border border-dashed border-slate-200 rounded-2xl p-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Simulador de rol (Mientras hago pruebas antes de crear el login de verdad, entonces el rol vendrá de <code className="bg-slate-100 px-1 rounded">useAuth().user.rol</code>)
      </p>
      <div className="flex gap-2">
        {['admin', 'monitor', 'usuario'].map(r => (
          <a
            key={r}
            href={`?rol=${r}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
              ${r === rolActual
                ? 'bg-cyan-600 text-white border-cyan-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-cyan-300'
              }`}
          >
            {r}
          </a>
        ))}
      </div>
    </div>
  );
}
