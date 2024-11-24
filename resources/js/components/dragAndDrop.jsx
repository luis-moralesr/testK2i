// src/components/ExcelUpload.js

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

const ExcelUpload = () => {
  const [fileData, setFileData] = useState(null);  // Guardará los datos leídos del Excel
  const [error, setError] = useState('');

  const { getRootProps, getInputProps } = useDropzone({
    accept: '.xlsx, .xls',  // Aceptar solo archivos Excel
    onDrop: (acceptedFiles) => handleFileUpload(acceptedFiles)
  });

  // Función para manejar la carga del archivo Excel
  const handleFileUpload = (files) => {
    const file = files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {

          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          // Convertir los datos de la hoja a formato JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          setFileData(jsonData);
          setError('');
        } catch (error) {
          setError('Error al procesar el archivo. Asegúrate de que el archivo sea un Excel válido.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div>
      <div {...getRootProps()} style={dropzoneStyle}>
        <input {...getInputProps()} />
        <p>Arrastra y suelta tu archivo Excel aquí, o haz clic para seleccionar uno</p>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Mostrar los datos del archivo (si se cargó correctamente) */}
      {fileData && (
        <div>
          <h3>Datos del archivo:</h3>
          <pre>{JSON.stringify(fileData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

// Estilo básico para el área de dropzone
const dropzoneStyle = {
  border: '2px dashed #cccccc',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer'
};

export default ExcelUpload;
