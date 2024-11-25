<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Persona;

class ConsultaController extends Controller
{
    public function showData()
    {
        $personas = Persona::with(['telefonos', 'direcciones'])->get();
        return response()->json($personas);
    }
}
