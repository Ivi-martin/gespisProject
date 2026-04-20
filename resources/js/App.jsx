// resources/js/App.jsx
// En Windows app.jsx y App.jsx no pueden coexistir en la misma carpeta,
// así que este archivo hace las dos funciones:
// 1. Punto de entrada de React (lo que era app.jsx)
// 2. Router principal con todas las rutas (lo que era App.jsx)

import React    from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '../css/app.css';

import Layout          from './components/layout/Layout';
import Dashboard       from './components/Dashboard';
import CursoForm       from './components/forms/CursoForm';
import MonitorForm     from './components/forms/MonitorForm';
import UsuarioForm     from './components/forms/UsuarioForm';
import CursosBuscar    from './pages/cursos/CursosBuscar';
import UsuariosBuscar  from './pages/usuarios/UsuariosBuscar';
import MonitoresBuscar from './pages/monitores/MonitoresBuscar';

function App() {
    const params  = new URLSearchParams(window.location.search);
    const rol     = params.get('rol') || 'admin';
    const nombres = { admin: 'Administrador', monitor: 'Pedro Ruiz', usuario: 'Ana Martín' };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard rol={rol} nombreUsuario={nombres[rol]} />} />

                    <Route path="cursos/nuevo"    element={<CursoForm />} />
                    <Route path="cursos/buscar"   element={<CursosBuscar />} />

                    <Route path="usuarios/nuevo"  element={<UsuarioForm />} />
                    <Route path="usuarios/buscar" element={<UsuariosBuscar />} />

                    <Route path="monitores/nuevo"  element={<MonitorForm />} />
                    <Route path="monitores/buscar" element={<MonitoresBuscar />} />

                    <Route path="cursos/eliminar"    element={<Navigate to="/cursos/buscar"    replace />} />
                    <Route path="usuarios/eliminar"  element={<Navigate to="/usuarios/buscar"  replace />} />
                    <Route path="monitores/eliminar" element={<Navigate to="/monitores/buscar" replace />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
