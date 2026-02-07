import { config } from './config';
import express from 'express';
import cors from 'cors';
import { sessionMiddleware } from './middleware/session';
import authRouter from './routes/auth';
import pipelineRouter from './routes/pipeline';
import profileRouter from './routes/profile';
import generateRouter from './routes/generate';

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(sessionMiddleware);

app.use('/api/auth', authRouter);
app.use('/api/pipeline', pipelineRouter);
app.use('/api/profile', profileRouter);
app.use('/api/generate', generateRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(config.PORT, () => {
  console.log(`[boggart] server running on http://localhost:${config.PORT}`);
});
