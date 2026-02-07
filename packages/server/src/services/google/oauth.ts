import { google } from 'googleapis';
import { config } from '../../config';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export function createOAuth2Client() {
  return new google.auth.OAuth2(
    config.GOOGLE_CLIENT_ID,
    config.GOOGLE_CLIENT_SECRET,
    `${config.BASE_URL}/api/auth/callback/google`,
  );
}

export function getAuthUrl(client: InstanceType<typeof google.auth.OAuth2>) {
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
}

export async function getTokensFromCode(
  client: InstanceType<typeof google.auth.OAuth2>,
  code: string,
) {
  const { tokens } = await client.getToken(code);
  return tokens;
}

export async function getUserInfo(client: InstanceType<typeof google.auth.OAuth2>) {
  const oauth2 = google.oauth2({ version: 'v2', auth: client });
  const { data } = await oauth2.userinfo.get();
  return {
    id: data.id!,
    email: data.email!,
    name: data.name!,
    picture: data.picture ?? undefined,
  };
}
