<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Curso;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;


class CursoController extends Controller
{
    // ── GET /api/cursos  ──────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $query = Curso::with(['monitor:dni,nombre,apellido1', 'usuarios:dni'])
                      ->withCount('usuarios');   

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
            201 
        );
    }

    // ── GET /api/cursos/{codigo}  ─────────────────────────────────
    // Devuelve un curso con todos sus datos: monitor + lista de inscritos.
    
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
    // curso_usuario y curso_monitor automáticamente —
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
