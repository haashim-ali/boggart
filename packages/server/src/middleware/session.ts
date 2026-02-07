import session from 'express-session';
import { config } from '../config';

const isProduction = config.BASE_URL.startsWith('https');

export const sessionMiddleware = session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? 'lax' : false,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
});
