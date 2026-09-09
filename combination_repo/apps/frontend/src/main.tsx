import React from 'react';
import ReactDOM from 'react-dom/client';
import { APP_NAME } from '@combination/shared';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div>Welcome to {APP_NAME} Frontend</div>
  </React.StrictMode>
);
