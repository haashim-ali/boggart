import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import crypto from 'node:crypto';
import type { IngestionResult, Person, Moment } from '@boggart/shared';

/** Fetch all emails since October 2025, with full plain-text bodies */
export async function ingestGmail(auth: OAuth2Client): Promise<IngestionResult> {
  try {
    const gmail = google.gmail({ version: 'v1', auth });
    const people = new Map<string, Person>();
    const moments: Moment[] = [];

    // Collect all message IDs since October 2025
    const allMessageIds: string[] = [];
    let pageToken: string | undefined;

    do {
      const listRes = await gmail.users.messages.list({
        userId: 'me',
        q: 'after:2025/10/01',
        maxResults: 500,
        pageToken,
      });

      for (const msg of listRes.data.messages ?? []) {
        if (msg.id) allMessageIds.push(msg.id);
      }
      pageToken = listRes.data.nextPageToken ?? undefined;
    } while (pageToken);

    console.log(`[gmail] Found ${allMessageIds.length} emails since Oct 2025`);

    // Fetch in parallel batches of 20
    const BATCH_SIZE = 20;
    for (let i = 0; i < allMessageIds.length; i += BATCH_SIZE) {
      const batch = allMessageIds.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((id) =>
          gmail.users.messages.get({
            userId: 'me',
            id,
            format: 'full',
          }),
        ),
      );

      for (const result of results) {
        if (result.status !== 'fulfilled') continue;
        const detail = result.value;

        try {
          const headers = detail.data.payload?.headers ?? [];
          const getHeader = (name: string) =>
            headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? '';

          const from = getHeader('From');
          const to = getHeader('To');
          const subject = getHeader('Subject');
          const date = getHeader('Date');
          const snippet = detail.data.snippet ?? '';

          // Extract plain text body
          const body = extractPlainText(detail.data.payload);
          const truncatedBody = body.slice(0, 800);

          // Extract people
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
            metadata: { subject, snippet, body: truncatedBody },
          });
        } catch {
          // Skip individual message parse failures
        }
      }
    }

    console.log(`[gmail] Processed ${moments.length} emails, ${people.size} contacts`);

    return {
      source: 'gmail',
      people: Array.from(people.values()),
      moments,
      artifacts: [],
    };
  } catch (err) {
    console.error('[gmail] Worker failed:', err);
    return { source: 'gmail', people: [], moments: [], artifacts: [] };
  }
}

/** Recursively extract plain text from a MIME message payload */
function extractPlainText(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const p = payload as Record<string, unknown>;

  // Check if this part is text/plain
  if (p.mimeType === 'text/plain' && p.body) {
    const body = p.body as Record<string, unknown>;
    if (typeof body.data === 'string') {
      return Buffer.from(body.data, 'base64url').toString('utf-8');
    }
  }

  // Recurse into parts
  if (Array.isArray(p.parts)) {
    for (const part of p.parts) {
      const text = extractPlainText(part);
      if (text) return text;
    }
  }

  return '';
}
