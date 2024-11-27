<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Persona;
use App\Models\Direcciones;
use App\Models\Telefono;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

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
        if (!$request->hasFile('excel_file')) {
            return response()->json(['error' => 'No se proporcionó ningún archivo'], 400);
        }

        $file = $request->file('excel_file');

        if ($file->getClientOriginalExtension() !== 'csv') {
            return response()->json(['error' => 'El archivo debe ser de tipo CSV'], 400);
        }

        try {
            // Guardar CSV temporalmente
            $filePath = $file->storeAs('', 'temp_file.csv', 'public');

            // Obtener la ruta absoluta del archivo
            $absolutePath = public_path('app/temp_file.csv');
            $correctedPath = str_replace('\\', '/', $absolutePath);

            // Ejecutar consulta SQL para cargar los datos desde el archivo
            $query = "
                LOAD DATA LOCAL INFILE '{$correctedPath}'
                INTO TABLE temp_personas
                FIELDS TERMINATED BY ',' ENCLOSED BY '\"'
                LINES TERMINATED BY '\\n'
                IGNORE 1 ROWS
                (nombre, paterno, materno, telefono, calle, numero_exterior, numero_interior, colonia, cp)
            ";

            // Consulta SQL
            DB::connection()->getPdo()->exec($query);

            // Procesar los datos desde la tabla temporal
            $tempPersonas = DB::table('temp_personas')->get();

            foreach ($tempPersonas as $item) {
                $persona = Persona::firstOrCreate(
                    [
                        'nombre' => $item->nombre,
                        'paterno' => $item->paterno,
                        'materno' => $item->materno
                    ]
                );

                if (!Telefono::where('persona_id', $persona->id)->where('numero', $item->telefono)->exists()) {
                    Telefono::create([
                        'persona_id' => $persona->id,
                        'numero' => $item->telefono
                    ]);
                }

                // Verificar si la dirección ya existe, si no, crear una nueva dirección
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

            DB::table('temp_personas')->truncate();

            // Eliminar el archivo temporal
            Storage::disk('public')->delete('temp_file.csv');

            return response()->json(['success' => 'Datos procesados correctamente']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al procesar el archivo: ' . $e->getMessage()], 500);
        }
    }


}
