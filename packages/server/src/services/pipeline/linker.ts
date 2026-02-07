import type { IngestionResult, EntityGraph, Person } from '@boggart/shared';

export function linkEntities(results: IngestionResult[]): EntityGraph {
  const emailToPerson = new Map<string, Person>();
  const idMapping = new Map<string, string>(); // old id -> merged id

  // First pass: merge people by email
  for (const result of results) {
    for (const person of result.people) {
      const normalizedEmails = person.emails.map((e) => e.toLowerCase());
      const existingEmail = normalizedEmails.find((e) => emailToPerson.has(e));

      if (existingEmail) {
        // Merge into existing person
        const existing = emailToPerson.get(existingEmail)!;
        idMapping.set(person.id, existing.id);

        // Merge emails
        for (const email of normalizedEmails) {
          if (!existing.emails.includes(email)) {
            existing.emails.push(email);
          }
          emailToPerson.set(email, existing);
        }

        // Merge phones
        for (const phone of person.phones) {
          if (!existing.phones.includes(phone)) {
            existing.phones.push(phone);
          }
        }

        // Merge sources
        for (const source of person.sources) {
          if (!existing.sources.includes(source)) {
            existing.sources.push(source);
          }
        }

        // Merge interaction count
        existing.interactionCount += person.interactionCount;

        // Use most recent interaction
        if (person.lastInteraction && (!existing.lastInteraction || person.lastInteraction > existing.lastInteraction)) {
          existing.lastInteraction = person.lastInteraction;
        }

        // Prefer non-email name
        if (person.name && !person.name.includes('@') && existing.name.includes('@')) {
          existing.name = person.name;
        }
      } else {
        // New person
        const merged: Person = { ...person, emails: normalizedEmails };
        idMapping.set(person.id, merged.id);
        for (const email of normalizedEmails) {
          emailToPerson.set(email, merged);
        }
      }
    }
  }

  // Deduplicated people
  const people = [...new Set(emailToPerson.values())];

  // Build full id mapping for all original IDs
  for (const result of results) {
    for (const person of result.people) {
      if (!idMapping.has(person.id)) {
        // Person with no emails that didn't get merged
        idMapping.set(person.id, person.id);
      }
    }
  }

  // Collect and update moments
  const moments = results.flatMap((r) =>
    r.moments.map((m) => ({
      ...m,
      peopleIds: m.peopleIds
        .map((id) => idMapping.get(id) ?? id)
        .filter((id, i, arr) => arr.indexOf(id) === i),
    })),
  );

  // Collect artifacts
  const artifacts = results.flatMap((r) => r.artifacts);

  return { people, moments, artifacts };
}
