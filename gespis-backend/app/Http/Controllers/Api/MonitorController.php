<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Monitor;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;


class MonitorController extends Controller
{
    // ── GET /api/monitores  ───────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $query = Monitor::withCount('cursosPrincipales');  // nº de cursos como responsable

        if ($request->filled('q')) {
            $patron = '%' . $request->q . '%';
            $query->where(function ($q) use ($patron) {
                $q->where('dni',       'like', $patron)
                  ->orWhere('nombre',    'like', $patron)
                  ->orWhere('apellido1', 'like', $patron)
                  ->orWhere('apellido2', 'like', $patron);
            });
        }

        return response()->json($query->orderBy('apellido1')->get());
    }

    // ── POST /api/monitores  ──────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'dni'              => 'required|string|size:9|unique:monitores,dni|regex:/^[0-9]{8}[A-Za-z]$/',
            'nombre'           => 'required|string|max:50',
            'apellido1'        => 'required|string|max:50',
            'apellido2'        => 'nullable|string|max:50',
            'fecha_nacimiento' => 'nullable|date|before:-18 years',  // mayor de 18
            'direccion'        => 'nullable|string|max:150',
            'telefono'         => 'nullable|string|regex:/^[6789]\d{8}$/',
            'email'            => 'nullable|email|max:100|unique:monitores,email',
        ], [
            'dni.unique'             => 'Ya existe un monitor con ese DNI.',
            'dni.regex'              => 'El DNI debe tener 8 dígitos y una letra.',
            'dni.size'               => 'El DNI debe tener exactamente 9 caracteres.',
            'fecha_nacimiento.before'=> 'El monitor debe tener al menos 18 años.',
            'telefono.regex'         => 'El teléfono no es válido (9 dígitos, empieza por 6, 7, 8 ó 9).',
            'email.unique'           => 'Ya existe un monitor con ese email.',
        ]);

        // Forzar DNI en mayúsculas (igual que validarDNI en el JS del frontend)
        $data['dni'] = strtoupper($data['dni']);

        $monitor = Monitor::create($data);

        return response()->json($monitor, 201);
    }

    // ── GET /api/monitores/{dni}  ─────────────────────────────────
    // Devuelve el monitor con todos sus cursos.

    public function show(string $dni): JsonResponse
    {
        $monitor = Monitor::with([
            'cursosPrincipales:codigo,nombrec,dias,hora,aforomax',
        ])
        ->findOrFail($dni);

        // Añadir nombre completo calculado
        $monitor->nombre_completo = $monitor->nombre_completo;

        return response()->json($monitor);
    }

    // ── PUT /api/monitores/{dni}  ─────────────────────────────────

    public function update(Request $request, string $dni): JsonResponse
    {
        $monitor = Monitor::findOrFail($dni);

        $data = $request->validate([
            'nombre'           => 'required|string|max:50',
            'apellido1'        => 'required|string|max:50',
            'apellido2'        => 'nullable|string|max:50',
            'fecha_nacimiento' => 'nullable|date|before:-18 years',
            'direccion'        => 'nullable|string|max:150',
            'telefono'         => 'nullable|string|regex:/^[6789]\d{8}$/',
            'email'            => "nullable|email|max:100|unique:monitores,email,{$dni},dni",
        ], [
            'fecha_nacimiento.before' => 'El monitor debe tener al menos 18 años.',
            'telefono.regex'          => 'El teléfono no es válido.',
            'email.unique'            => 'Ese email ya está registrado en otro monitor.',
        ]);

        $monitor->update($data);

        return response()->json($monitor);
    }

    // ── DELETE /api/monitores/{dni}  ──────────────────────────────
    // Gracias a onDelete('set null') en la migración de cursos,
    // los cursos del monitor no se borran, solo quedan sin monitor asignado.
    public function destroy(string $dni): JsonResponse
    {
        $monitor = Monitor::findOrFail($dni);
        $nombre  = $monitor->nombre_completo;
        $monitor->delete();

        return response()->json([
            'message' => "Monitor \"{$nombre}\" eliminado. Sus cursos han quedado sin monitor asignado."
        ]);
    }
}
