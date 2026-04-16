<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CursoController;
use App\Http\Controllers\Api\MonitorController;
use App\Http\Controllers\Api\UsuarioController;



Route::apiResource('cursos', CursoController::class);
Route::apiResource('monitores', MonitorController::class);
Route::apiResource('usuarios', UsuarioController::class);

// Endpoints de inscripción — 

Route::post(
    'usuarios/{dni}/inscribir/{codigo}',
    [UsuarioController::class, 'inscribir']
)->name('usuarios.inscribir');

Route::delete(
    'usuarios/{dni}/inscribir/{codigo}',
    [UsuarioController::class, 'darDeBaja']
)->name('usuarios.darDeBaja');
