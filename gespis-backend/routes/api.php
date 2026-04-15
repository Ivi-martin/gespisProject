<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CursoController;
use App\Http\Controllers\Api\MonitorController;
use App\Http\Controllers\Api\UsuarioController;

/*
|--------------------------------------------------------------------------
| API Routes — GesPis
|--------------------------------------------------------------------------
|
| Equivalente completo a los métodos de CursosDB.java, MonitoresDB.java
| y UsuariosDB.java, pero expuestos como endpoints REST.
|
| apiResource() genera automáticamente estas 5 rutas por recurso:
|   GET    /api/{recurso}         → index   (listar)
|   POST   /api/{recurso}         → store   (crear)
|   GET    /api/{recurso}/{id}    → show    (detalle)
|   PUT    /api/{recurso}/{id}    → update  (modificar)
|   DELETE /api/{recurso}/{id}    → destroy (eliminar)
|
| Puedes verlas todas ejecutando: php artisan route:list
|
*/

Route::apiResource('cursos', CursoController::class);
Route::apiResource('monitores', MonitorController::class);
Route::apiResource('usuarios', UsuarioController::class);

// Endpoints de inscripción — equivale a inscribirUsuario() y darDeBaja() del Java
// Se accede como subruta del usuario para que la URL sea semántica:
//   POST   /api/usuarios/12345678A/inscribir/NAT-A1
//   DELETE /api/usuarios/12345678A/inscribir/NAT-A1
Route::post(
    'usuarios/{dni}/inscribir/{codigo}',
    [UsuarioController::class, 'inscribir']
)->name('usuarios.inscribir');

Route::delete(
    'usuarios/{dni}/inscribir/{codigo}',
    [UsuarioController::class, 'darDeBaja']
)->name('usuarios.darDeBaja');
