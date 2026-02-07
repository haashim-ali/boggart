import type { EntityGraph, Moment, Person } from '@boggart/shared';
import { createClient, condenseBatch } from '../gemini/client';

/**
 * Condense the full entity graph into a rich text summary using Haiku.
 * Each data source is condensed independently, and independent batches
 * run in parallel via Promise.all.
 */
export async function condenseEntityGraph(graph: EntityGraph): Promise<string> {
  const client = createClient();

  // ── Prepare email batches ────────────────────────────────────
  const emailMoments = graph.moments.filter(
    (m) => m.source === 'gmail',
  );
  const emailBatchSize = 50;
  const emailBatches: string[][] = [];

  for (let i = 0; i < emailMoments.length; i += emailBatchSize) {
    const batch = emailMoments.slice(i, i + emailBatchSize);
    emailBatches.push(
      batch.map((m) => formatEmail(m, graph.people)),
    );
  }

  // ── Prepare YouTube items ────────────────────────────────────
  const ytSubscriptions = graph.artifacts.filter(
    (a) => a.source === 'youtube' && a.type === 'channel',
  );
  const ytVideos = graph.artifacts.filter(
    (a) => a.source === 'youtube' && a.type === 'video',
  );

  const youtubeItems: string[] = [
    ...ytSubscriptions.map(
      (a) => `[Sub] ${a.title}${a.description ? ' - ' + a.description.slice(0, 200) : ''}`,
    ),
    ...ytVideos.map((a) => {
      const channel = (a.metadata.channelTitle as string) ?? 'Unknown';
      const tags = Array.isArray(a.metadata.tags)
        ? (a.metadata.tags as string[]).join(', ')
        : '';
      const desc = a.description ? a.description.slice(0, 200) : '';
      return `[Liked] ${a.title} (by ${channel})${tags ? ' - tags: ' + tags : ''}${desc ? ' - ' + desc : ''}`;
    }),
  ];

  // ── Prepare calendar items ───────────────────────────────────
  const calendarMoments = graph.moments.filter(
    (m) => m.source === 'calendar',
  );
  const calendarItems = calendarMoments.map((m) => {
    const attendees = m.peopleIds
      .map((pid) => {
        const person = graph.people.find((p) => p.id === pid);
        return person ? person.name : pid;
      })
      .join(', ');
    const location = (m.metadata.location as string) ?? '';
    return `${m.timestamp} | ${m.summary} | Attendees: ${attendees || 'none'} | Location: ${location || 'none'}`;
  });

  // ── Prepare drive items ──────────────────────────────────────
  const driveArtifacts = graph.artifacts.filter(
    (a) => a.source === 'drive',
  );
  const driveItems = driveArtifacts.map(
    (a) => `${a.title} | ${a.type} | Modified: ${a.modifiedAt ?? 'unknown'}`,
  );

  // ── Contacts (no Haiku needed — already structured) ──────────
  const contactsSummary = formatContacts(graph.people);

  // ── Batch YouTube items in groups of 50 ─────────────────────
  const batchSize = 50;
  const youtubeBatches: string[][] = [];
  for (let i = 0; i < youtubeItems.length; i += batchSize) {
    youtubeBatches.push(youtubeItems.slice(i, i + batchSize));
  }

  // ── Batch calendar items in groups of 50 ───────────────────
  const calendarBatches: string[][] = [];
  for (let i = 0; i < calendarItems.length; i += batchSize) {
    calendarBatches.push(calendarItems.slice(i, i + batchSize));
  }

  // ── Batch drive items in groups of 50 ──────────────────────
  const driveBatches: string[][] = [];
  for (let i = 0; i < driveItems.length; i += batchSize) {
    driveBatches.push(driveItems.slice(i, i + batchSize));
  }

  // ── Fire all Haiku calls in parallel ─────────────────────────
  const emailPromises = emailBatches.map((batch) =>
    condenseBatch(client, 'email communications', batch),
  );

  const youtubePromises = youtubeBatches.map((batch) =>
    condenseBatch(client, 'YouTube activity (subscriptions and liked videos)', batch),
  );

  const calendarPromises = calendarBatches.map((batch) =>
    condenseBatch(client, 'calendar meetings and events', batch),
  );

  const drivePromises = driveBatches.map((batch) =>
    condenseBatch(client, 'Google Drive files and documents', batch),
  );

  const [emailResults, youtubeResults, calendarResults, driveResults] =
    await Promise.all([
      Promise.all(emailPromises),
      Promise.all(youtubePromises),
      Promise.all(calendarPromises),
      Promise.all(drivePromises),
    ]);

  const emailSummaries = emailResults;
  const youtubeSummary =
    youtubeResults.length > 0 ? youtubeResults.join('\n\n') : 'No YouTube data available.';
  const calendarSummary =
    calendarResults.length > 0 ? calendarResults.join('\n\n') : 'No calendar data available.';
  const driveSummary =
    driveResults.length > 0 ? driveResults.join('\n\n') : 'No Drive data available.';

  // ── Assemble final condensed text ────────────────────────────
  const sections: string[] = [];

  sections.push(`== EMAIL ANALYSIS ==\n${emailSummaries.length > 0 ? emailSummaries.join('\n\n') : 'No email data available.'}`);
  sections.push(`== YOUTUBE ANALYSIS ==\n${youtubeSummary}`);
  sections.push(`== CALENDAR ANALYSIS ==\n${calendarSummary}`);
  sections.push(`== CONTACTS ==\n${contactsSummary}`);
  sections.push(`== DRIVE ANALYSIS ==\n${driveSummary}`);

  return sections.join('\n\n');
}

/** Format a single email moment into a condensable line */
function formatEmail(moment: Moment, people: Person[]): string {
  const names = moment.peopleIds
    .map((pid) => {
      const person = people.find((p) => p.id === pid);
      return person ? person.name : pid;
    })
    .join(', ');
  const subject = (moment.metadata.subject as string) ?? moment.summary;
  const body = (moment.metadata.body as string) ?? (moment.metadata.snippet as string) ?? '';
  const direction = moment.type === 'email_sent' ? 'To' : 'From';
  return `${moment.timestamp} | ${direction}: ${names} | ${subject} | ${body}`;
}

/** Format contacts as a structured list (no Haiku needed) */
function formatContacts(people: Person[]): string {
  if (people.length === 0) return 'No contacts available.';

  // Sort by interaction count descending
  const sorted = [...people].sort(
    (a, b) => b.interactionCount - a.interactionCount,
  );

  return sorted
    .map(
      (p) =>
        `${p.name} | ${p.emails.join(', ')} | ${p.interactionCount} interactions | Sources: ${p.sources.join(', ')}`,
    )
    .join('\n');
}
