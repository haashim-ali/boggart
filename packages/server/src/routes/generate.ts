import { Router } from 'express';
import type { GenerateRequest, GenerateResponse, BrandsResponse } from '@boggart/shared';
import { requireAuth } from '../middleware/requireAuth';
import { store } from '../services/db/store';
import { generateContent, generateBrandAds } from '../services/content/generator';

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { goal } = req.body as GenerateRequest;
    if (!goal) {
      res.status(400).json({ error: 'Missing goal' });
      return;
    }

    const profile = store.getProfile(req.session.userId!);
    if (!profile) {
      res.status(404).json({ error: 'Profile not found. Run the pipeline first.' });
      return;
    }

    const content = await generateContent(profile, goal);
    store.addContent(req.session.userId!, content);

    const response: GenerateResponse = { content };
    res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Content generation failed';
    res.status(500).json({ error: message });
  }
});

router.get('/brands', requireAuth, async (req, res) => {
  try {
    const profile = store.getProfile(req.session.userId!);
    if (!profile) {
      res.status(404).json({ error: 'Profile not found. Run the pipeline first.' });
      return;
    }

    const brands = await generateBrandAds(profile);
    for (const content of brands) {
      store.addContent(req.session.userId!, content);
    }

    const response: BrandsResponse = { brands };
    res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Brand generation failed';
    res.status(500).json({ error: message });
  }
});

export default router;
