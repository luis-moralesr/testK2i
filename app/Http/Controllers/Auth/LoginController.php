<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * Handle a login request to the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
{
    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Credenciales Invalidas'], 401);
    }

    $payload = [
        'iss' => env('APP_URL'),
        'sub' => $user->id,
        'iat' => now()->timestamp,
        'exp' => now()->addMinutes(60)->timestamp // Expira en 60 minutos
    ];

    $jwt = JWT::encode($payload, env('JWT_SECRET'), 'HS256'); // Genera el JWT con una clave secreta

    // Agregar los datos del usuario a la sesión
    return redirect()->route('home')->with([
        'token' => $jwt,
        'expires_at' => now()->addMinutes(60),
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role
        ]
    ]);
}
    public function showLoginForm()
    {
        return view('auth.login');
    }

    /**
     * Handle user logout.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // Revocar el token
        $request->user()->token()->revoke();

        return response()->json([
            'message' => 'Logged out Correcto'
        ]);
    }
}
