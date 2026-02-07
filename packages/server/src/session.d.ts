import type { AuthUser } from '@boggart/shared';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  }
}
