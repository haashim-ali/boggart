import type { Profile, EntityGraph, GeneratedContent } from '@boggart/shared';

interface StoreData {
  profile: Profile;
  entities: EntityGraph;
  content: GeneratedContent[];
}

class Store {
  private data = new Map<string, StoreData>();

  getProfile(userId: string): Profile | null {
    return this.data.get(userId)?.profile ?? null;
  }

  getEntities(userId: string): EntityGraph | null {
    return this.data.get(userId)?.entities ?? null;
  }

  getContent(userId: string): GeneratedContent[] {
    return this.data.get(userId)?.content ?? [];
  }

  getContentById(userId: string, contentId: string): GeneratedContent | undefined {
    return this.data.get(userId)?.content.find((c) => c.id === contentId);
  }

  upsert(userId: string, profile: Profile, entities: EntityGraph): void {
    const existing = this.data.get(userId);
    this.data.set(userId, {
      profile,
      entities,
      content: existing?.content ?? [],
    });
  }

  addContent(userId: string, content: GeneratedContent): void {
    const existing = this.data.get(userId);
    if (existing) {
      existing.content.push(content);
    }
  }
}

export const store = new Store();
