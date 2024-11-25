<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Persona;
use App\Models\Direcciones;
use App\Models\Telefono;
use Illuminate\Support\Facades\DB;

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

    public function loadDataInfile(Request $request)
{
    try {
        // Subir archivo CSV al servidor
        $file = $request->file('csv_file');
        if (!$file->isValid()) {
            return response()->json(['error' => 'Archivo no válido'], 400);
        }

        $filePath = $file->storeAs('uploads', 'temp_data.csv', 'local');
        $absolutePath = storage_path('app/' . $filePath);

        // Crear una tabla temporal
        DB::statement("
            CREATE TEMPORARY TABLE IF NOT EXISTS temp_personas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(255),
                paterno VARCHAR(255),
                materno VARCHAR(255),
                telefono VARCHAR(20),
                calle VARCHAR(255),
                numero_exterior VARCHAR(20),
                numero_interior VARCHAR(20),
                colonia VARCHAR(255),
                cp VARCHAR(10)
            )
        ");

        // Cargar el archivo csv
        DB::statement("LOAD DATA INFILE '{$absolutePath}'
            INTO TABLE temp_personas
            FIELDS TERMINATED BY ','
            ENCLOSED BY '\"'
            LINES TERMINATED BY '\n'
            IGNORE 1 ROWS
            (nombre, paterno, materno, telefono, calle, numero_exterior, numero_interior, colonia, cp)
        ");

        $tempData = DB::table('temp_personas')->get();

        foreach ($tempData as $item) {
            // Validar persona
            $persona = Persona::firstOrCreate(
                [
                    'nombre' => $item->nombre,
                    'paterno' => $item->paterno,
                    'materno' => $item->materno
                ]
            );

            // Validar telefono
            if (!Telefono::where('persona_id', $persona->id)->where('numero', $item->telefono)->exists()) {
                Telefono::create([
                    'persona_id' => $persona->id,
                    'numero' => $item->telefono
                ]);
            }

            // Validar direccion
            if (!Direcciones::where('persona_id', $persona->id)
                ->where('calle', $item->calle)
                ->where('numero_exterior', $item->numero_exterior)
                ->where('colonia', $item->colonia)
                ->exists()) {
                Direcciones::create([
                    'persona_id' => $persona->id,
                    'calle' => $item->calle,
                    'numero_exterior' => $item->numero_exterior,
                    'numero_interior' => $item->numero_interior,
                    'colonia' => $item->colonia,
                    'cp' => $item->cp
                ]);
            }
        }

        // Eliminar el archivo temporal
        unlink($absolutePath);

        return response()->json(['success' => 'Datos cargados y procesados correctamente']);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

}
