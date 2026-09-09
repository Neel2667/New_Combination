import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { APP_NAME, APP_VERSION, HealthResponse } from '@combination/shared';

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/health')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data: HealthResponse) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div id="app-container" className="p-8 max-w-2xl mx-auto">
      <header className="mb-6 border-b pb-4">
        <h1 id="app-title" className="text-2xl font-bold tracking-tight">
          {APP_NAME}
        </h1>
        <p id="app-version" className="text-sm text-gray-500">
          Foundation v{APP_VERSION}
        </p>
      </header>

      <section id="health-status-card" className="border rounded-lg p-4 bg-white shadow-sm">
        <h2 id="health-heading" className="text-lg font-semibold mb-2">
          System Health
        </h2>
        {loading && <p id="health-loading" className="text-gray-500">Checking backend status...</p>}
        {error && (
          <p id="health-error" className="text-red-600">
            Backend connection status: {error}
          </p>
        )}
        {health && (
          <div id="health-details" className="text-sm space-y-1">
            <p><strong>Status:</strong> {health.status}</p>
            <p><strong>App:</strong> {health.app}</p>
            <p><strong>Version:</strong> {health.version}</p>
            <p><strong>Timestamp:</strong> {health.timestamp}</p>
          </div>
        )}
      </section>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
