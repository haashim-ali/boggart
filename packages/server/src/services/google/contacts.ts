import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import crypto from 'node:crypto';
import type { IngestionResult, Person } from '@boggart/shared';

export async function ingestContacts(auth: OAuth2Client): Promise<IngestionResult> {
  try {
    const people = google.people({ version: 'v1', auth });

    const res = await people.people.connections.list({
      resourceName: 'people/me',
      pageSize: 500,
      personFields: 'names,emailAddresses,phoneNumbers',
    });

    const connections = res.data.connections ?? [];
    const persons: Person[] = [];

    for (const connection of connections) {
      const names = connection.names ?? [];
      const emails = (connection.emailAddresses ?? [])
        .map((e) => e.value?.toLowerCase())
        .filter((e): e is string => !!e);
      const phones = (connection.phoneNumbers ?? [])
        .map((p) => p.value)
        .filter((p): p is string => !!p);

      const name = names[0]?.displayName || emails[0] || 'Unknown';

      persons.push({
        id: crypto.randomUUID(),
        name,
        emails,
        phones,
        sources: ['contacts'],
        interactionCount: 0,
      });
    }

    return {
      source: 'contacts',
      people: persons,
      moments: [],
      artifacts: [],
    };
  } catch {
    return { source: 'contacts', people: [], moments: [], artifacts: [] };
  }
}
