import express, { Request, Response } from 'express';
import cors from 'cors';
import { APP_NAME, APP_VERSION, HealthResponse } from '@combination/shared';

const app = express();
const port = process.env.BACKEND_PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response<HealthResponse>) => {
  res.status(200).json({
    status: 'ok',
    app: APP_NAME,
    version: APP_VERSION,
    timestamp: new Date().toISOString()
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`[backend] Health service listening on port ${port}`);
  });
}

export default app;
