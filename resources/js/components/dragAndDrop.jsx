import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import axios from 'axios';

const ExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [headers, setHeaders] = useState([]);
  const [tableData, setTableData] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: '.xlsx, .xls, .csv',
    onDrop: (acceptedFiles) => handleFileUpload(acceptedFiles),
  });

  const handleFileUpload = (files) => {
    const uploadedFile = files[0];

    if (uploadedFile) {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const csvData = XLSX.utils.sheet_to_csv(worksheet); // Convertir hoja a CSV
          const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          const extractedHeaders = sheetData[0] || [];

          setHeaders(extractedHeaders);
          setFile(new Blob([csvData], { type: 'text/csv' })); // Crear un Blob de CSV
          setError('');
        } catch (error) {
          setError('Error al procesar el archivo. Asegúrate de que sea válido.');
        }
      };

      reader.readAsArrayBuffer(uploadedFile);
    }
  };

  const sendToLaravel = async () => {
    if (!file) {
      setError('No hay archivo para enviar.');
      return;
    }

    const formData = new FormData();
    formData.append('excel_file', file, 'archivo_convertido.csv');

    setError('');
    try {
      const response = await axios.post('/subirCsv', formData, {
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        alert('Datos enviados correctamente');
        setTimeout(() => location.reload(), 100);
        // setFile(null); // Limpiar el drop-zone
        // setTableData(response.data); // Asumimos que la respuesta contiene los datos para la tabla
      } else {
        throw new Error('Error al enviar los datos al controlador.');
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
          <h3>Cabeceras detectadas:</h3>
          <ul>
            {headers.map((header, index) => (
              <li key={index}>{header}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={sendToLaravel}
        disabled={!file}
        className="btn btn-primary"
        style={{ marginTop: '20px' }}
      >
        Enviar a Laravel
      </button>

      {tableData.length > 0 && (
        <DataTable data={tableData} />
      )}
    </div>
  );
};

// Componente de la tabla de datos
const DataTable = ({ data }) => {
  return (
    <div>
      <table className="table table-striped" border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{`${item.nombre} ${item.paterno} ${item.materno}`}</td>
              <td>
                <button className="btn btn-primary">Ver más</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const dropzoneStyle = {
  border: '2px dashed #cccccc',
  padding: '10px',
  textAlign: 'center',
  cursor: 'pointer',
  margin: '2em auto',
  width: '90%',
};

export default ExcelUpload;
