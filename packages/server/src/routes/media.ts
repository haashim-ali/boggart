import { createReadStream, existsSync } from 'node:fs';
import { Router } from 'express';
import type { MediaStatusResponse } from '@boggart/shared';
import { requireAuth } from '../middleware/requireAuth';
import { store } from '../services/db/store';
import { getVideoFilePath } from '../services/google-ai/video';

const router = Router();

/** Poll video generation status for a specific content item */
router.get('/video/:contentId/status', requireAuth, (req, res) => {
  try {
    const content = store.getContentById(req.session.userId!, req.params.contentId);
    if (!content) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }
    const response: MediaStatusResponse = {
      contentId: content.id,
      video: content.videoScript.generatedVideo,
    };
    res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get video status';
    res.status(500).json({ error: message });
  }
});

/** Stream the generated video file */
router.get('/video/:contentId', requireAuth, (req, res) => {
  try {
    const content = store.getContentById(req.session.userId!, req.params.contentId);
    if (!content) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    const filePath = getVideoFilePath(req.params.contentId);
    if (!filePath || !existsSync(filePath)) {
      res.status(404).json({ error: 'Video file not available' });
      return;
    }

    res.setHeader('Content-Type', 'video/mp4');
    const stream = createReadStream(filePath);
    stream.on('error', () => res.status(500).end());
    stream.pipe(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to serve video';
    res.status(500).json({ error: message });
  }
});

export default router;
