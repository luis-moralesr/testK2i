import React, { Component } from 'react'
import ExcelUpload from './components/dragAndDrop';

export default class Test1 extends React.Component {
    render() {
      return (
        <div className="App">
          <h1>Cargar archivo Excel</h1>
          <ExcelUpload />
        </div>
      );
    }
  }



