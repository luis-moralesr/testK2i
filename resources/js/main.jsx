import React from 'react';
import ReactDOM from 'react-dom/client';

import Test1 from './test1.jsx';
import Tabla from './components/tabla';

const root = ReactDOM.createRoot(document.getElementById('root'));
const tabla = ReactDOM.createRoot(document.getElementById('tabla'));

root.render(
  <React.StrictMode>
    <Test1 />
  </React.StrictMode>
);

tabla.render(
    <React.StrictMode>
      <Tabla />
    </React.StrictMode>
  );
