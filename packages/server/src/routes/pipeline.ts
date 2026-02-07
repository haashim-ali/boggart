import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { startPipeline, getStatus } from '../services/pipeline/orchestrator';

const router = Router();

router.post('/start', requireAuth, (req, res) => {
  try {
    startPipeline(
      req.session.userId!,
      req.session.accessToken!,
      req.session.refreshToken,
    );
    res.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start pipeline';
    res.status(500).json({ error: message });
  }
});

router.get('/status', requireAuth, (req, res) => {
  try {
    const status = getStatus(req.session.userId!);
    res.json(status);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get status';
    res.status(500).json({ error: message });
  }
});

export default router;
