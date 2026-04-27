import { NavLink, Outlet } from 'react-router-dom';


// CardLayout → React Router (cada <Panel> = una <Route>)

const NAV_ITEMS = [
  {
    label: 'Cursos',
    links: [
      { to: '/cursos/nuevo',    text: 'Nuevo curso'    },
      { to: '/cursos/buscar',   text: 'Buscar curso'   },
      { to: '/cursos/eliminar', text: 'Eliminar curso' },
    ],
  },
  {
    label: 'Usuarios',
    links: [
      { to: '/usuarios/nuevo',    text: 'Nuevo usuario'    },
      { to: '/usuarios/buscar',   text: 'Buscar usuario'   },
      { to: '/usuarios/eliminar', text: 'Eliminar usuario' },
    ],
  },
  {
    label: 'Monitores',
    links: [
      { to: '/monitores/nuevo',    text: 'Nuevo monitor'    },
      { to: '/monitores/buscar',   text: 'Buscar monitor'   },
      { to: '/monitores/eliminar', text: 'Eliminar monitor' },
    ],
  },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── HEADER ── */}
      <header className="bg-cyan-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo / título */}
          <div className="flex items-center gap-3">
            <img src="/images/logo1.png" alt="Logo GesPis" className="h-10 w-auto" />
            <div>
              <h1 className="text-white text-2xl font-bold tracking-tight leading-none">
                Piscina Francisco Ayala
              </h1>
              <p className="text-cyan-200 text-xs tracking-widest uppercase">
                Gestión de Piscina
              </p>
            </div>
          </div>

          {/* Menú de navegación  */}
          <nav className="flex gap-2">
            {NAV_ITEMS.map((section) => (
              <div key={section.label} className="relative group">
                <button className="px-4 py-2 rounded-lg text-white font-semibold
                                   hover:bg-cyan-600 transition-colors text-sm tracking-wide">
                  {section.label}
                  <span className="ml-1 text-cyan-300">▾</span>
                </button>

                {/* Dropdown  */}
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl
                                shadow-xl border border-slate-100 opacity-0 invisible
                                group-hover:opacity-100 group-hover:visible
                                transition-all duration-150 z-50">
                  {section.links.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        `block px-4 py-2.5 text-sm first:rounded-t-xl last:rounded-b-xl
                         transition-colors
                         ${isActive
                           ? 'bg-cyan-50 text-cyan-700 font-semibold'
                           : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                         }`
                      }
                    >
                      {link.text}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </header>

      {/* ── PANEL LATERAL + CONTENIDO CENTRAL ── */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">

        {/* Sidebar decorativo  */}
        <aside className="hidden lg:flex flex-col gap-4 w-48 shrink-0">
          {['Cursos', 'Noticias', 'Eventos'].map((nombre, i) => (
            <div
              key={nombre}
              className="rounded-2xl p-4 text-center text-white font-semibold text-sm shadow-md"
              style={{
                background: ['#0891b2','#0e7490','#155e75'][i],
              }}
            >
              {['🏊‍♂️','🤸‍♀️','🤽‍♂️'][i]}
              <p className="mt-1">{nombre}</p>
            </div>
          ))}
        </aside>

        {/* Zona central dinámica  */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-cyan-900 text-cyan-300 text-center py-3 text-xs mt-8">
        <p>GesPis - Gestión integral de instalaciones acuáticas</p>
        <p>Aplicaciones Iván MOCA © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
