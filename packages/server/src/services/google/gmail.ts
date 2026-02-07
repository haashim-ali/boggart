import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import crypto from 'node:crypto';
import type { IngestionResult, Person, Moment } from '@boggart/shared';

export async function ingestGmail(auth: OAuth2Client): Promise<IngestionResult> {
  try {
    const gmail = google.gmail({ version: 'v1', auth });

    const listRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 200,
    });

    const messageIds = listRes.data.messages ?? [];
    const people = new Map<string, Person>();
    const moments: Moment[] = [];

    for (const msg of messageIds) {
      if (!msg.id) continue;

      try {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['From', 'To', 'Subject', 'Date'],
        });

        const headers = detail.data.payload?.headers ?? [];
        const getHeader = (name: string) =>
          headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? '';

        const from = getHeader('From');
        const to = getHeader('To');
        const subject = getHeader('Subject');
        const date = getHeader('Date');
        const snippet = detail.data.snippet ?? '';

        const contacts = [from, to].filter(Boolean);
        const peopleIds: string[] = [];

        for (const contact of contacts) {
          const emailMatch = contact.match(/<([^>]+)>/);
          const email = emailMatch ? emailMatch[1] : contact.trim();
          const nameMatch = contact.match(/^([^<]+)</);
          const name = nameMatch ? nameMatch[1].trim().replace(/"/g, '') : email;

          if (!email) continue;

          const normalizedEmail = email.toLowerCase();
          if (!people.has(normalizedEmail)) {
            people.set(normalizedEmail, {
              id: crypto.randomUUID(),
              name: name || email,
              emails: [normalizedEmail],
              phones: [],
              sources: ['gmail'],
              interactionCount: 0,
            });
          }

          const person = people.get(normalizedEmail)!;
          person.interactionCount++;
          person.lastInteraction = date ? new Date(date).toISOString() : undefined;
          peopleIds.push(person.id);
        }

        const isReceived = from && !from.includes('me');
        moments.push({
          id: crypto.randomUUID(),
          source: 'gmail',
          timestamp: date ? new Date(date).toISOString() : new Date().toISOString(),
          type: isReceived ? 'email_received' : 'email_sent',
          summary: subject || snippet,
          peopleIds,
          metadata: { subject, snippet },
        });
      } catch {
        // Skip individual messages that fail
      }
    }

    return {
      source: 'gmail',
      people: Array.from(people.values()),
      moments,
      artifacts: [],
    };
  } catch {
    return { source: 'gmail', people: [], moments: [], artifacts: [] };
  }
}
