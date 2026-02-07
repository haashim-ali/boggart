import { Router } from 'express';
import type { ProfileResponse, EntitiesResponse } from '@boggart/shared';
import { requireAuth } from '../middleware/requireAuth';
import { store } from '../services/db/store';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  try {
    const profile = store.getProfile(req.session.userId!);
    const response: ProfileResponse = { profile };
    res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get profile';
    res.status(500).json({ error: message });
  }
});

router.get('/entities', requireAuth, (req, res) => {
  try {
    const entities = store.getEntities(req.session.userId!);
    const response: EntitiesResponse = { entities };
    res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get entities';
    res.status(500).json({ error: message });
  }
});

export default router;
