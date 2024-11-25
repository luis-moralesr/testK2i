<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Http\Middleware\VerifyToken;


// Rutas públicas
Route::get('/', function () {
    return view('welcome');
});

Route::post('/api/validate-token', function (Request $request) {
    $authHeader = $request->header('Authorization');
    $token = str_replace('Bearer ', '', $authHeader);

    try {
        $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
        return response()->json(['message' => 'Token válido'], 200);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Token inválido o expirado'], 401);
    }
});

Route::post('/storeData', [App\Http\Controllers\SubirDatosController::class, 'storeExcelData']);
Route::get('/showData', [App\Http\Controllers\ConsultaController::class, 'showData']);

Auth::routes();

Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');

