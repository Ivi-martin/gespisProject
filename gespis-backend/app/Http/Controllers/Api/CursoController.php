<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Curso;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

/**
 * CursoController
 *
 * Equivalente a CursosDB.java del proyecto Java.
 * Cada método del Java se convierte en un endpoint REST:
 *
 *  insertarCurso()   → POST   /api/cursos          (store)
 *  buscarCursos()    → GET    /api/cursos?q=...     (index)
 *  actualizarCurso() → PUT    /api/cursos/{codigo}  (update)
 *  eliminarCurso()   → DELETE /api/cursos/{codigo}  (destroy)
 *                      GET    /api/cursos/{codigo}  (show)
 */
class CursoController extends Controller
{
    // ── GET /api/cursos  ──────────────────────────────────────────
    // Equivale a buscarCursos() del Java. Si viene ?q=xxx filtra,
    // si no devuelve todos los cursos con su monitor y nº de inscritos.
    public function index(Request $request): JsonResponse
    {
        $query = Curso::with(['monitor:dni,nombre,apellido1', 'usuarios:dni'])
                      ->withCount('usuarios');   // añade usuarios_count al JSON

        if ($request->filled('q')) {
            $patron = '%' . $request->q . '%';
            $query->where(function ($q) use ($patron) {
                $q->where('codigo',  'like', $patron)
                  ->orWhere('nombrec', 'like', $patron);
            });
        }

        return response()->json($query->get());
    }

    // ── POST /api/cursos  ─────────────────────────────────────────
    // Equivale a insertarCurso() + la inserción en curso_monitor del Java.
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'codigo'      => 'required|string|max:20|unique:cursos,codigo|regex:/^[A-Za-z0-9\-]+$/',
            'nombrec'     => 'required|string|max:100',
            'dias'        => 'required|string|max:50',
            'hora'        => 'required|string|max:20',
            'aforomax'    => 'required|integer|min:1|max:100',
            'monitor_dni' => 'nullable|string|exists:monitores,dni',
        ], [
            // Mensajes en castellano (los recibirá el React)
            'codigo.unique'        => 'Ya existe un curso con ese código.',
            'codigo.regex'         => 'El código solo puede contener letras, números y guiones.',
            'aforomax.min'         => 'El aforo mínimo es 1.',
            'monitor_dni.exists'   => 'El monitor seleccionado no existe en la base de datos.',
        ]);

        $curso = Curso::create($data);

        // Si tiene monitor, también lo registramos en la tabla pivote curso_monitor
        if ($curso->monitor_dni) {
            $curso->monitores()->attach($curso->monitor_dni);
        }

        return response()->json(
            $curso->load('monitor:dni,nombre,apellido1'),
            201   // HTTP 201 Created
        );
    }

    // ── GET /api/cursos/{codigo}  ─────────────────────────────────
    // Devuelve un curso con todos sus datos: monitor + lista de inscritos.
    // Equivale al bloque de búsqueda individual del Java.
    public function show(string $codigo): JsonResponse
    {
        $curso = Curso::with([
            'monitor:dni,nombre,apellido1,apellido2,email',
            'usuarios:dni,nombre,apellido1,apellido2',
        ])
        ->withCount('usuarios')
        ->findOrFail($codigo);   // lanza 404 automáticamente si no existe

        // Añadimos plazas disponibles calculadas desde el Model
        $curso->plazas_disponibles = $curso->plazasDisponibles();

        return response()->json($curso);
    }

    // ── PUT /api/cursos/{codigo}  ─────────────────────────────────
    // Equivale a actualizarCurso() del Java (UPDATE + borrar y rehacer inscripciones).
    public function update(Request $request, string $codigo): JsonResponse
    {
        $curso = Curso::findOrFail($codigo);

        $data = $request->validate([
            'codigo'      => "required|string|max:20|unique:cursos,codigo,{$codigo},codigo|regex:/^[A-Za-z0-9\-]+$/",
            'nombrec'     => 'required|string|max:100',
            'dias'        => 'required|string|max:50',
            'hora'        => 'required|string|max:20',
            'aforomax'    => 'required|integer|min:1|max:100',
            'monitor_dni' => 'nullable|string|exists:monitores,dni',
            // Lista opcional de DNIs de usuarios inscritos (para sincronizar)
            'usuarios'    => 'nullable|array',
            'usuarios.*'  => 'string|exists:usuarios,dni',
        ]);

        $curso->update($data);

        // Sincronizar usuarios inscritos si vienen en el body
        // sync() borra y vuelve a insertar, igual que el Java:
        //   DELETE FROM curso_usuario + INSERT...
        if ($request->has('usuarios')) {
            $curso->usuarios()->sync($request->usuarios);
        }

        // Actualizar pivote curso_monitor
        if (isset($data['monitor_dni'])) {
            $curso->monitores()->sync(
                $data['monitor_dni'] ? [$data['monitor_dni']] : []
            );
        }

        return response()->json($curso->load('monitor:dni,nombre,apellido1'));
    }

    // ── DELETE /api/cursos/{codigo}  ──────────────────────────────
    // Equivale a eliminarCurso() del Java.
    // Las FK con onDelete('cascade') en la migración ya borran
    // curso_usuario y curso_monitor automáticamente — no hay que hacerlo a mano.
    public function destroy(string $codigo): JsonResponse
    {
        $curso = Curso::findOrFail($codigo);
        $nombre = $curso->nombrec;
        $curso->delete();

        return response()->json([
            'message' => "Curso \"{$nombre}\" eliminado correctamente."
        ]);
    }
}
