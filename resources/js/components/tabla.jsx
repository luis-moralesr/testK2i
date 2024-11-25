import React, { useEffect, useState } from 'react';

const DataTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedRow, setExpandedRow] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 100;

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/showData', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });

            if (response.ok) {
                const result = await response.json();
                setData(result);
                setError('');
            } else {
                throw new Error('Error al obtener los datos del servidor');
            }
        } catch (err) {
            setError(`Error al obtener los datos: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleExpand = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (loading) return <p>Cargando datos...</p>;
    if (error) return <p>{error}</p>;
    if (!loading && data.length === 0) return <p>No se encontraron datos.</p>;

    return (
        <div>
            <table class="table table-striped" border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {currentData.map((item) => (
                        <React.Fragment key={item.id}>
                            <tr>
                                <td>{item.id}</td>
                                <td>{`${item.nombre} ${item.paterno} ${item.materno}`}</td>
                                <td>
                                    <button onClick={() => toggleExpand(item.id)} class="btn btn-primary">
                                        {expandedRow === item.id ? 'Ocultar' : 'Ver más'}
                                    </button>
                                </td>
                            </tr>
                            {expandedRow === item.id && (
                                <tr>
                                    <td colSpan="3">
                                        <strong>Teléfonos:</strong>
                                        <ul>
                                            {item.telefonos && item.telefonos.map((telefono) => (
                                                <li key={telefono.id}>
                                                    {telefono.numero}
                                                </li>
                                            ))}
                                        </ul>
                                        <strong>Direcciones:</strong>
                                        <ul>
                                            {item.direcciones && item.direcciones.map((direccion) => (
                                                <li key={direccion.id}>
                                                    {`${direccion.calle}, ${direccion.numero_exterior} ${direccion.numero_interior}, ${direccion.colonia}, CP ${direccion.cp}`}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
            {data.length > itemsPerPage && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    {Array.from({ length: Math.ceil(data.length / itemsPerPage) }, (_, index) => (
                        <button
                            key={index}
                            onClick={() => paginate(index + 1)}
                            style={{
                                margin: '0 5px',
                                padding: '5px 10px',
                                backgroundColor: currentPage === index + 1 ? '#007BFF' : '#f1f1f1',
                                color: currentPage === index + 1 ? '#fff' : '#000',
                                border: '1px solid #ccc',
                                cursor: 'pointer',
                            }}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DataTable;
