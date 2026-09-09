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
    console.log(`Backend running on port ${port}`);
  });
}

export default app;
