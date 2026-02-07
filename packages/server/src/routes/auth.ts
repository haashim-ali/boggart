import { Router } from 'express';
import type { AuthUser, MeResponse } from '@boggart/shared';
import { createOAuth2Client, getAuthUrl, getTokensFromCode, getUserInfo } from '../services/google/oauth';

const router = Router();

router.get('/login', (_req, res) => {
  const client = createOAuth2Client();
  const url = getAuthUrl(client);
  res.redirect(url);
});

router.get('/callback/google', async (req, res) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      res.status(400).json({ error: 'Missing authorization code' });
      return;
    }

    const client = createOAuth2Client();
    const tokens = await getTokensFromCode(client, code);
    client.setCredentials(tokens);

    const userInfo = await getUserInfo(client);
    const user: AuthUser = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    };

    req.session.userId = user.id;
    req.session.accessToken = tokens.access_token!;
    req.session.refreshToken = tokens.refresh_token ?? '';
    req.session.user = user;

    res.redirect('http://localhost:5173');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OAuth callback failed';
    res.status(500).json({ error: message });
  }
});

router.get('/me', (req, res) => {
  const response: MeResponse = { user: req.session.user ?? null };
  res.json(response);
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to logout' });
      return;
    }
    res.json({ ok: true });
  });
});

export default router;
