import { useState, useEffect, useCallback } from 'react';

/**
 * SearchList — componente genérico reutilizable para las 3 vistas de búsqueda.
 * Equivale a PanelBuscarCurso.java / PanelBuscarUsuario.java / PanelBuscarMonitor.java
 *
 * Props:
 *  endpoint     string   — URL de la API sin el /api/, ej: 'cursos'
 *  columns      array    — [{ key, label, render? }]
 *  searchPlaceholder string
 *  onEdit       fn(item) — callback al pulsar editar
 *  onDelete     fn(item) — callback al pulsar eliminar
 *  emptyText    string
 */
export default function SearchList({
  endpoint,
  columns,
  searchPlaceholder = 'Buscar…',
  onEdit,
  onDelete,
  emptyText = 'No se encontraron resultados.',
}) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [searched, setSearched] = useState(false);

  const buscar = useCallback(async (q) => {
    setLoading(true);
    setError('');
    try {
      const url = q.trim()
        ? `/api/${endpoint}?q=${encodeURIComponent(q)}`
        : `/api/${endpoint}`;
      const res  = await fetch(url, { headers: { Accept: 'application/json' } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al buscar.');
      setResults(Array.isArray(data) ? data : data.data ?? []);
      setSearched(true);
    } catch (e) {
      setError(e.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  // Búsqueda en tiempo real con debounce de 350 ms
  useEffect(() => {
    const t = setTimeout(() => buscar(query), 350);
    return () => clearTimeout(t);
  }, [query, buscar]);

  return (
    <div className="flex flex-col gap-4">

      {/* Barra de búsqueda */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white
                     text-sm text-slate-800 outline-none transition-all
                     focus:ring-2 focus:ring-cyan-400 focus:border-transparent
                     hover:border-cyan-300"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400
                       hover:text-slate-600 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400 px-1">
          <span className="w-4 h-4 border-2 border-slate-200 border-t-cyan-500 rounded-full animate-spin" />
          Buscando…
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="text-red-400">⚠</span>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Tabla de resultados */}
      {!loading && searched && (
        results.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
            <p className="text-slate-400 text-sm">{emptyText}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {results.length} resultado{results.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {columns.map(col => (
                      <th
                        key={col.key}
                        className="px-5 py-3 text-left text-xs font-semibold text-slate-500
                                   uppercase tracking-wider whitespace-nowrap"
                      >
                        {col.label}
                      </th>
                    ))}
                    {(onEdit || onDelete) && (
                      <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500
                                     uppercase tracking-wider">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {results.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      {columns.map(col => (
                        <td key={col.key} className="px-5 py-3 text-slate-700 whitespace-nowrap">
                          {col.render ? col.render(item) : item[col.key] ?? '—'}
                        </td>
                      ))}
                      {(onEdit || onDelete) && (
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {onEdit && (
                              <button
                                onClick={() => onEdit(item)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium
                                           bg-cyan-50 text-cyan-700 border border-cyan-200
                                           hover:bg-cyan-100 transition-colors"
                              >
                                Editar
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(item)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium
                                           bg-red-50 text-red-600 border border-red-200
                                           hover:bg-red-100 transition-colors"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Estado inicial — antes de buscar */}
      {!loading && !searched && !error && (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
          <p className="text-slate-300 text-3xl mb-3">🔍</p>
          <p className="text-slate-400 text-sm">
            Escribe en el buscador para ver resultados.
          </p>
        </div>
      )}
    </div>
  );
}
