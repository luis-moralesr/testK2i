<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Persona;
use App\Models\Direcciones;
use App\Models\Telefono;


class SubirDatosController extends Controller
{
    public function storeExcelData(Request $request)
{
    $data = $request->input('data');

    foreach ($data as $item) {
        // Validar si la persona ya existe
        $persona = Persona::firstOrCreate(
            [
                'nombre' => $item['nombre'],
                'paterno' => $item['paterno'],
                'materno' => $item['materno']
            ]
        );

        // Verificar y agregar el teléfono si no existe
        if (!Telefono::where('persona_id', $persona->id)->where('numero', $item['telefono'])->exists()) {
            Telefono::create([
                'persona_id' => $persona->id,
                'numero' => $item['telefono']
            ]);
        }

        // Verificar y agregar la dirección si no existe
        if (!Direcciones::where('persona_id', $persona->id)
            ->where('calle', $item['calle'])
            ->where('numero_exterior', $item['numero_exterior'])
            ->where('colonia', $item['colonia'])
            ->exists()) {
            Direcciones::create([
                'persona_id' => $persona->id,
                'calle' => $item['calle'],
                'numero_exterior' => $item['numero_exterior'],
                'numero_interior' => $item['numero_interior'],
                'colonia' => $item['colonia'],
                'cp' => $item['cp']
            ]);
        }
    }

    return response()->json(['success' => 'Datos procesados y almacenados correctamente']);
}

}
