#!/bin/bash
set -e

cd combination_repo

# Root package.json
cat << 'PKG' > package.json
{
  "name": "combination",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspaces",
    "build": "npm run build --workspaces",
    "test": "vitest run",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit --workspaces"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tsx": "^4.0.0",
    "@types/node": "^20.0.0",
    "vitest": "^1.0.0"
  }
}
PKG

# Root tsconfig
cat << 'TSCONF' > tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true
  }
}
TSCONF

# Shared Package
mkdir -p packages/shared/src
cat << 'PKG' > packages/shared/package.json
{
  "name": "@combination/shared",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts"
}
PKG

cat << 'TSCONF' > packages/shared/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
TSCONF

echo "export const APP_NAME = 'Combination';" > packages/shared/src/index.ts
cat << 'TEST' > packages/shared/src/index.test.ts
import { expect, test } from 'vitest';
import { APP_NAME } from './index';
test('APP_NAME is Combination', () => {
  expect(APP_NAME).toBe('Combination');
});
TEST

# Backend
mkdir -p apps/backend/src
cat << 'PKG' > apps/backend/package.json
{
  "name": "@combination/backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js",
    "build": "tsc"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "@combination/shared": "*"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0"
  }
}
PKG

cat << 'TSCONF' > apps/backend/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
TSCONF

cat << 'INDEX' > apps/backend/src/index.ts
import express from 'express';
import cors from 'cors';
import { APP_NAME } from '@combination/shared';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: APP_NAME });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(\`Backend running on port \${port}\`);
  });
}

export default app;
INDEX

cat << 'TEST' > apps/backend/src/health.test.ts
import { expect, test } from 'vitest';
import request from 'supertest';
import app from './index';

test('GET /health', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('ok');
});
TEST

# Frontend
mkdir -p apps/frontend/src
cat << 'PKG' > apps/frontend/package.json
{
  "name": "@combination/frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@combination/shared": "*"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
PKG

cat << 'TSCONF' > apps/frontend/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["DOM", "DOM.Iterable", "ESNext"]
  },
  "include": ["src"]
}
TSCONF

cat << 'VITE' > apps/frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
VITE

cat << 'INDEX' > apps/frontend/index.html
<!DOCTYPE html>
<html lang="en">
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
INDEX

cat << 'MAIN' > apps/frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { APP_NAME } from '@combination/shared';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div>Welcome to {APP_NAME} Frontend</div>
  </React.StrictMode>
);
MAIN

