import React from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
    return <h1>¡React está funcionando!</h1>;
};

const root = document.getElementById('app');
if (root) {
    const rootElement = ReactDOM.createRoot(root);
    rootElement.render(<App />);
}
