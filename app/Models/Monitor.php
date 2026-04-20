<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Model Monitor
 *
 * Equivalente a GesMonitores.java (que extendía GesPersonas.java).
 * En PHP no hay herencia obligatoria para campos compartidos entre entidades;
 * los campos de GesPersonas se incluyen directamente en cada tabla.
 * Si quisieras reutilizar validaciones comunes puedes crear un FormRequest base.
 *
 * @property string  $dni
 * @property string  $nombre
 * @property string  $apellido1
 * @property string  $apellido2
 * @property string  $fecha_nacimiento
 * @property string  $direccion
 * @property string  $telefono
 * @property string  $email
 */
class Monitor extends Model
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
        'email',
    ];

    // Ocultar campos sensibles cuando se serialice a JSON (para la API)
    protected $hidden = [];

    // ---------------------------------------------------------------
    // Relaciones
    // ---------------------------------------------------------------

    /**
     * Cursos en los que este monitor es el responsable principal (FK directa).
     * Equivale a: los cursos donde monitor_dni = this->dni
     *
     * Uso: $monitor->cursosPrincipales
     */
    public function cursosPrincipales(): HasMany
    {
        return $this->hasMany(Curso::class, 'monitor_dni', 'dni');
    }

    /**
     * Todos los cursos del monitor (incluyendo pivot curso_monitor).
     * Equivale a cursosImpartidos de GesMonitores.java.
     *
     * Uso: $monitor->cursosImpartidos
     */
    public function cursosImpartidos(): BelongsToMany
    {
        return $this->belongsToMany(
            Curso::class,
            'curso_monitor',
            'dni_monitor',
            'codigoc'
        );
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    /**
     * Nombre completo formateado.
     * Equivale a: monitor.getNombre() + " " + monitor.getApellido1() del Java.
     */
    public function getNombreCompletoAttribute(): string
    {
        return trim("{$this->nombre} {$this->apellido1} {$this->apellido2}");
    }
}
