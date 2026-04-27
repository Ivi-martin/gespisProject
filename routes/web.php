<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\MonitorController;
use App\Http\Controllers\UsuarioController;
use Inertia\Inertia;



Route::get('/', function () {
    return Inertia::render('Welcome');
})->withoutMiddleware([\App\Http\Middleware\RedirectIfAuthenticated::class]);

// ── Rutas de la API (prefijo /api) ────────────────────────────────────────
// Route::prefix('api') agrupa las rutas bajo /api/...
// Route::middleware('web') ya está activo al estar en web.php

Route::prefix('api')->group(function () {

    // Cursos — genera GET/POST /api/cursos y GET/PUT/DELETE /api/cursos/{codigo}
    Route::apiResource('cursos',    CursoController::class);

    // Monitores
    Route::apiResource('monitores', MonitorController::class);

    // Usuarios
    Route::apiResource('usuarios',  UsuarioController::class);

    // Inscripción / baja — equivale a inscribirUsuario() y darDeBaja() del Java
    Route::post(  'usuarios/{dni}/inscribir/{codigo}', [UsuarioController::class, 'inscribir'] )->name('usuarios.inscribir');
    Route::delete('usuarios/{dni}/inscribir/{codigo}', [UsuarioController::class, 'darDeBaja'] )->name('usuarios.darDeBaja');

});

// ── Ruta catch-all — devuelve la SPA de React ────────────────────────────
// Cualquier URL que no sea /api/... la gestiona React Router en el navegador.
// Sin esto, al recargar /cursos/buscar Laravel devolvería un 404.
Route::get('/{any}', function () {
    return view('app');   // resources/views/app.blade.php — el HTML base de React
})->where('any', '^(?!api).*$');  // excluye rutas que empiezan por 'api'
