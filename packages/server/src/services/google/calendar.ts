import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import crypto from 'node:crypto';
import type { IngestionResult, Person, Moment } from '@boggart/shared';

export async function ingestCalendar(auth: OAuth2Client): Promise<IngestionResult> {
  try {
    const calendar = google.calendar({ version: 'v3', auth });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: sixMonthsAgo.toISOString(),
      maxResults: 250,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = res.data.items ?? [];
    const people = new Map<string, Person>();
    const moments: Moment[] = [];

    for (const event of events) {
      const attendees = event.attendees ?? [];
      const peopleIds: string[] = [];

      for (const attendee of attendees) {
        const email = attendee.email?.toLowerCase();
        if (!email) continue;

        if (!people.has(email)) {
          people.set(email, {
            id: crypto.randomUUID(),
            name: attendee.displayName || email,
            emails: [email],
            phones: [],
            sources: ['calendar'],
            interactionCount: 0,
          });
        }

        const person = people.get(email)!;
        person.interactionCount++;
        peopleIds.push(person.id);
      }

      const start = event.start?.dateTime || event.start?.date || '';
      moments.push({
        id: crypto.randomUUID(),
        source: 'calendar',
        timestamp: start ? new Date(start).toISOString() : new Date().toISOString(),
        type: 'meeting',
        summary: event.summary || 'Untitled event',
        peopleIds,
        metadata: {
          location: event.location,
          description: event.description,
          status: event.status,
        },
      });
    }

    return {
      source: 'calendar',
      people: Array.from(people.values()),
      moments,
      artifacts: [],
    };
  } catch {
    return { source: 'calendar', people: [], moments: [], artifacts: [] };
  }
}
