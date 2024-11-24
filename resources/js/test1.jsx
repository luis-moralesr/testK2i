import React, { Component } from 'react'
import ExcelUpload from './components/dragAndDrop';  // Correcta importación

export default class Test1 extends React.Component {
    render() {
      return (
        <div className="App">
          <h1>Cargar archivo Excel</h1>
          <ExcelUpload /> {/* Aquí debería funcionar si la importación es correcta */}
        </div>
      );
    }
  }

