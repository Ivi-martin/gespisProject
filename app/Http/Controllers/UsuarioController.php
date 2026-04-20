<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use App\Models\Curso;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;


class UsuarioController extends Controller
{
    // ── GET /api/usuarios  ────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = Usuario::withCount('cursos');  // nº de cursos inscritos

        if ($request->filled('q')) {
            $patron = '%' . $request->q . '%';
            $query->where(function ($q) use ($patron) {
                $q->where('dni',        'like', $patron)
                  ->orWhere('nombre',    'like', $patron)
                  ->orWhere('apellido1', 'like', $patron)
                  ->orWhere('municipio', 'like', $patron);
            });
        }

        return response()->json($query->orderBy('apellido1')->get());
    }

    // ── POST /api/usuarios  ───────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'dni'              => 'required|string|size:9|unique:usuarios,dni|regex:/^[0-9]{8}[A-Za-z]$/',
            'nombre'           => 'required|string|max:50',
            'apellido1'        => 'required|string|max:50',
            'apellido2'        => 'nullable|string|max:50',
            'fecha_nacimiento' => 'nullable|date|before:today',
            'direccion'        => 'nullable|string|max:150',
            'telefono'         => 'nullable|string|regex:/^[6789]\d{8}$/',
            'municipio'        => 'nullable|string|max:100',
        ], [
            'dni.unique'              => 'Ya existe un usuario con ese DNI.',
            'dni.regex'               => 'El DNI debe tener 8 dígitos y una letra.',
            'dni.size'                => 'El DNI debe tener exactamente 9 caracteres.',
            'fecha_nacimiento.before' => 'La fecha de nacimiento no puede ser futura.',
            'telefono.regex'          => 'El teléfono no es válido (9 dígitos, empieza por 6, 7, 8 ó 9).',
        ]);

        $data['dni'] = strtoupper($data['dni']);

        $usuario = Usuario::create($data);

        return response()->json($usuario, 201);
    }

    // ── GET /api/usuarios/{dni}  ──────────────────────────────────
    // Devuelve el usuario con los cursos en los que está inscrito.
    public function show(string $dni): JsonResponse
    {
        $usuario = Usuario::with([
            'cursos:codigo,nombrec,dias,hora,aforomax,monitor_dni',
        ])
        ->findOrFail($dni);

        $usuario->nombre_completo = $usuario->nombre_completo;

        return response()->json($usuario);
    }

    // ── PUT /api/usuarios/{dni}  ──────────────────────────────────

    public function update(Request $request, string $dni): JsonResponse
    {
        $usuario = Usuario::findOrFail($dni);

        $data = $request->validate([
            'nombre'           => 'required|string|max:50',
            'apellido1'        => 'required|string|max:50',
            'apellido2'        => 'nullable|string|max:50',
            'fecha_nacimiento' => 'nullable|date|before:today',
            'direccion'        => 'nullable|string|max:150',
            'telefono'         => 'nullable|string|regex:/^[6789]\d{8}$/',
            'municipio'        => 'nullable|string|max:100',
        ]);

        $usuario->update($data);

        return response()->json($usuario);
    }

    // ── DELETE /api/usuarios/{dni}  ───────────────────────────────
    // El cascade de la migración borra automáticamente sus filas en curso_usuario.
    public function destroy(string $dni): JsonResponse
    {
        $usuario = Usuario::findOrFail($dni);
        $nombre  = $usuario->nombre_completo;
        $usuario->delete();

        return response()->json([
            'message' => "Usuario \"{$nombre}\" eliminado y dado de baja de todos sus cursos."
        ]);
    }

    // ── POST /api/usuarios/{dni}/inscribir/{codigo}  ──────────────

    public function inscribir(string $dni, string $codigo): JsonResponse
    {
        $usuario = Usuario::findOrFail($dni);
        $curso   = Curso::findOrFail($codigo);

        // Comprobación 1: ¿ya está inscrito?
        if ($usuario->estaInscritoEn($codigo)) {
            return response()->json([
                'message' => 'Este usuario ya está inscrito en ese curso.'
            ], 422);
        }

        // Comprobación 2: ¿quedan plazas? 
        if (!$curso->puedeInscribir($dni)) {
            return response()->json([
                'message' => "El curso \"{$curso->nombrec}\" está completo (aforo: {$curso->aforomax})."
            ], 422);
        }

        // Inscribir (INSERT en curso_usuario)
        $curso->usuarios()->attach($dni);

        return response()->json([
            'message'            => "Usuario inscrito en \"{$curso->nombrec}\" correctamente.",
            'plazas_disponibles' => $curso->plazasDisponibles(),
        ], 201);
    }

    // ── DELETE /api/usuarios/{dni}/inscribir/{codigo}  ────────────

    public function darDeBaja(string $dni, string $codigo): JsonResponse
    {
        $usuario = Usuario::findOrFail($dni);
        $curso   = Curso::findOrFail($codigo);

        if (!$usuario->estaInscritoEn($codigo)) {
            return response()->json([
                'message' => 'Este usuario no está inscrito en ese curso.'
            ], 422);
        }

        // Desapuntar (DELETE en curso_usuario)
        $curso->usuarios()->detach($dni);

        return response()->json([
            'message' => "Usuario dado de baja de \"{$curso->nombrec}\" correctamente.",
        ]);
    }
}
