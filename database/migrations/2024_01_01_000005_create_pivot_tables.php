<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tablas pivote de relaciones M:N.
     *
     * curso_monitor  → un curso puede tener varios monitores (por si hay suplentes)
     * curso_usuario  → un usuario puede estar inscrito en varios cursos
     *
     * Ambas venían en el proyecto Java como tablas separadas.
     */
    public function up(): void
    {
        // Pivot: curso <-> monitor (relación M:N adicional)
        Schema::create('curso_monitor', function (Blueprint $table) {
            $table->string('codigoc', 20);
            $table->string('dni_monitor', 9);
            $table->primary(['codigoc', 'dni_monitor']);

            $table->foreign('codigoc')
                  ->references('codigo')
                  ->on('cursos')
                  ->onDelete('cascade');

            $table->foreign('dni_monitor')
                  ->references('dni')
                  ->on('monitores')
                  ->onDelete('cascade');
        });

        // Pivot: curso <-> usuario (inscripciones)
        Schema::create('curso_usuario', function (Blueprint $table) {
            $table->string('cod_curso', 20);
            $table->string('dni_usuario', 9);
            $table->timestamp('fecha_inscripcion')->useCurrent(); // campo extra útil en web
            $table->primary(['cod_curso', 'dni_usuario']);

            $table->foreign('cod_curso')
                  ->references('codigo')
                  ->on('cursos')
                  ->onDelete('cascade');

            $table->foreign('dni_usuario')
                  ->references('dni')
                  ->on('usuarios')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('curso_usuario');
        Schema::dropIfExists('curso_monitor');
    }
};
