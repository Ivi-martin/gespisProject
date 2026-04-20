<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabla de cursos.
     * Equivalente a GesCursos.java.
     * Clave primaria: codigo (string, no autoincremental).
     * FK a monitores para el monitor principal del curso.
     *
     * IMPORTANTE: Esta migración va después de monitores (000002),
     * ya que tiene una FK que depende de ella.
     */
    public function up(): void
    {
        Schema::create('cursos', function (Blueprint $table) {
            $table->string('codigo', 20)->primary();
            $table->string('nombrec', 100);
            $table->string('dias', 50);        // ej: "Lunes, Miércoles, Viernes"
            $table->string('hora', 20);        // ej: "09:00 - 10:00"
            $table->unsignedSmallInteger('aforomax');
            $table->string('monitor_dni', 9)->nullable();
            $table->timestamps();

            $table->foreign('monitor_dni')
                  ->references('dni')
                  ->on('monitores')
                  ->onDelete('set null');   // Si el monitor se borra, el curso queda sin monitor asignado
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cursos');
    }
};
