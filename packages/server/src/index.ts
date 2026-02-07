import { config } from './config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sessionMiddleware } from './middleware/session';
import authRouter from './routes/auth';
import pipelineRouter from './routes/pipeline';
import profileRouter from './routes/profile';
import generateRouter from './routes/generate';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Trust proxy for ngrok/reverse proxies (needed for secure cookies over HTTPS)
app.set('trust proxy', 1);

app.use(cors({ origin: config.BASE_URL, credentials: true }));
app.use(express.json());
app.use(sessionMiddleware);

app.use('/api/auth', authRouter);
app.use('/api/pipeline', pipelineRouter);
app.use('/api/profile', profileRouter);
app.use('/api/generate', generateRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Serve built frontend in production
const webDist = path.resolve(__dirname, '../../web/dist');
app.use(express.static(webDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(webDist, 'index.html'));
});

app.listen(config.PORT, () => {
  console.log(`[boggart] server running on ${config.BASE_URL}`);
});
