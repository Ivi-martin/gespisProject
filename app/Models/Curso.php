<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Model Curso
 *
 * Equivalente a GesCursos.java + CursosDB.java del proyecto Java.
 * En Eloquent, toda la lógica de consultas SQL se reemplaza por relaciones
 * y métodos del ORM; ya no hay que escribir PreparedStatements a mano.
 *
 * @property string  $codigo
 * @property string  $nombrec
 * @property string  $dias
 * @property string  $hora
 * @property int     $aforomax
 * @property string  $monitor_dni
 */
class Curso extends Model
{
    // La PK no es 'id' numérico, sino 'codigo' string → hay que indicarlo
    protected $primaryKey   = 'codigo';
    protected $keyType      = 'string';
    public    $incrementing = false;

    protected $fillable = [
        'codigo',
        'nombrec',
        'dias',
        'hora',
        'aforomax',
        'monitor_dni',
    ];

    // ---------------------------------------------------------------
    // Relaciones
    // ---------------------------------------------------------------

    /**
     * Monitor principal asignado al curso.
     * Equivale a: psCurso.setString(6, c.getMonitor().getDni())  del Java.
     *
     * Uso: $curso->monitor->nombre
     */
    public function monitor(): BelongsTo
    {
        return $this->belongsTo(Monitor::class, 'monitor_dni', 'dni');
    }

    /**
     * Todos los usuarios inscritos en este curso (tabla pivot curso_usuario).
     * Equivale a la lista listUsuarios de GesCursos.java.
     *
     * Uso: $curso->usuarios  →  Collection de objetos Usuario
     */
    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(
            Usuario::class,
            'curso_usuario',   // tabla pivot
            'cod_curso',       // FK hacia cursos
            'dni_usuario'      // FK hacia usuarios
        )->withPivot('fecha_inscripcion')->withTimestamps();
    }

    /**
     * Monitores adicionales del curso (tabla pivot curso_monitor).
     * La tabla Java tenía esta relación separada de monitor_dni.
     *
     * Uso: $curso->monitores
     */
    public function monitores(): BelongsToMany
    {
        return $this->belongsToMany(
            Monitor::class,
            'curso_monitor',
            'codigoc',
            'dni_monitor'
        );
    }

    // ---------------------------------------------------------------
    // Helpers (lógica de negocio del Java, portada a PHP)
    // ---------------------------------------------------------------

    /**
     * Comprueba si quedan plazas y el usuario no está ya inscrito.
     * Equivale al método inscribirUsuario() de GesCursos.java.
     */
    public function puedeInscribir(string $dniUsuario): bool
    {
        $yaInscrito   = $this->usuarios()->where('dni', $dniUsuario)->exists();
        $plazasLibres = $this->usuarios()->count() < $this->aforomax;

        return $plazasLibres && !$yaInscrito;
    }

    /**
     * Devuelve el número de plazas disponibles.
     */
    public function plazasDisponibles(): int
    {
        return max(0, $this->aforomax - $this->usuarios()->count());
    }
}
