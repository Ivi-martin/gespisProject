<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Model Usuario
 *
 * Equivalente a GesUsuarios.java (que extendía GesPersonas.java).
 * Representa a un alumno/miembro de la piscina, no al usuario de login.
 * El usuario de login está en App\Models\User (tabla 'users' de Laravel).
 *
 * @property string  $dni
 * @property string  $nombre
 * @property string  $apellido1
 * @property string  $apellido2
 * @property string  $fecha_nacimiento
 * @property string  $direccion
 * @property string  $telefono
 * @property string  $municipio
 */
class Usuario extends Model
{
    protected $primaryKey   = 'dni';
    protected $keyType      = 'string';
    public    $incrementing = false;

    protected $fillable = [
        'dni',
        'nombre',
        'apellido1',
        'apellido2',
        'fecha_nacimiento',
        'direccion',
        'telefono',
        'municipio',
    ];

    // ---------------------------------------------------------------
    // Relaciones
    // ---------------------------------------------------------------

    /**
     * Cursos en los que este usuario está inscrito.
     * Equivale a la lista listUsuarios de GesCursos.java (vista desde el usuario).
     *
     * Uso: $usuario->cursos
     *      $usuario->cursos()->where('dias', 'Lunes')->get()
     */
    public function cursos(): BelongsToMany
    {
        return $this->belongsToMany(
            Curso::class,
            'curso_usuario',
            'dni_usuario',
            'cod_curso'
        )->withPivot('fecha_inscripcion')->withTimestamps();
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    /**
     * Nombre completo formateado.
     */
    public function getNombreCompletoAttribute(): string
    {
        return trim("{$this->nombre} {$this->apellido1} {$this->apellido2}");
    }

    /**
     * Comprueba si el usuario ya está inscrito en un curso concreto.
     * Equivale al contains() de ArrayList en el Java.
     */
    public function estaInscritoEn(string $codigoCurso): bool
    {
        return $this->cursos()->where('codigo', $codigoCurso)->exists();
    }
}
