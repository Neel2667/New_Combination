import React from 'react';
import ReactDOM from 'react-dom/client';
import { AssetPantry } from './AssetPantry';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AssetPantry />
    </React.StrictMode>
  );
}
