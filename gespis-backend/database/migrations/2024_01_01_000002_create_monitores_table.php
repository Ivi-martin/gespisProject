<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabla de monitores.
     * Equivalente a la clase GesMonitores.java (hereda de GesPersonas).
     * Clave primaria: DNI (string, no autoincremental).
     */
    public function up(): void
    {
        Schema::create('monitores', function (Blueprint $table) {
            $table->string('dni', 9)->primary();
            $table->string('nombre', 50);
            $table->string('apellido1', 50);
            $table->string('apellido2', 50)->nullable();
            $table->date('fecha_nacimiento')->nullable();
            $table->string('direccion', 150)->nullable();
            $table->string('telefono', 15)->nullable();
            $table->string('email', 100)->unique()->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitores');
    }
};
