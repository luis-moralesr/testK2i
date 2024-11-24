import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx'; // Importamos la librería xlsx

const ExcelUpload = () => {
  const [fileData, setFileData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState('');

  const { getRootProps, getInputProps } = useDropzone({
    accept: '.xlsx, .xls', // Aceptar solo archivos Excel
    onDrop: (acceptedFiles) => handleFileUpload(acceptedFiles) // Llamar a la función para procesar el archivo cuando se sube
  });

  // Función que maneja la carga y lectura del archivo Excel
  const handleFileUpload = (files) => {
    const file = files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' }); // Leemos el archivo como un arreglo de bytes
          const worksheet = workbook.Sheets[workbook.SheetNames[0]]; // Obtenemos la primera hoja del Excel

          // Obtener las cabeceras de la primera fila
          const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          const extractedHeaders = sheetData[0]; // Primera fila como cabeceras
          setHeaders(extractedHeaders);

          // Convertimos la hoja a formato JSON, excluyendo la fila de cabeceras
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          setFileData(jsonData);  // Almacenamos los datos en el estado
          setError('');  // Limpiamos cualquier error previo
        } catch (error) {
          setError('Error al procesar el archivo. Asegúrate de que el archivo sea un Excel válido.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const sendToLaravel = async () => {
    if (!fileData) {
      setError('No hay datos para enviar.');
      return;
    }

    try {
      const response = await fetch('/api/store-excel-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ data: fileData })
      });

      if (response.ok) {
        alert('Datos enviados correctamente');
      } else {
        throw new Error('Error al enviar los datos');
      }
    } catch (error) {
      setError(`Error al enviar los datos: ${error.message}`);
    }
  };


  return (
    <div>
      <div {...getRootProps()} style={dropzoneStyle}>
        <input {...getInputProps()} />
        <p>Arrastra y suelta tu archivo Excel aquí, o haz clic para seleccionar uno</p>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {headers.length > 0 && (
        <div>
          <h3>Cabeceras del archivo:</h3>
          <ul>
            {headers.map((header, index) => (
              <li key={index}>{header}</li>
            ))}
          </ul>
        </div>
      )}

      {/* {fileData && (
        <div>
          <h3>Datos del archivo:</h3>
          <pre>{JSON.stringify(fileData, null, 2)}</pre>
        </div>
      )} */}

      <button onClick={sendToLaravel} disabled={!fileData}>Enviar a Laravel</button>
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
