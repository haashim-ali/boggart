/** Data sources we can ingest from a Google account */
export type DataSource = 'gmail' | 'calendar' | 'contacts' | 'youtube' | 'drive';

/** A person discovered across one or more data sources */
export interface Person {
  id: string;
  name: string;
  emails: string[];
  phones: string[];
  relationship?: string;
  sources: DataSource[];
  interactionCount: number;
  lastInteraction?: string; // ISO 8601
}

/** Classification of a timestamped event */
export type MomentType =
  | 'email_sent'
  | 'email_received'
  | 'meeting'
  | 'document_edit'
  | 'video_interaction'
  | 'subscription';

/** A timestamped event or interaction */
export interface Moment {
  id: string;
  source: DataSource;
  timestamp: string; // ISO 8601
  type: MomentType;
  summary: string;
  peopleIds: string[]; // References Person.id
  metadata: Record<string, unknown>;
}

/** Classification of a digital artifact */
export type ArtifactType =
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'video'
  | 'image'
  | 'channel'
  | 'other';

/** A digital artifact (file, video, subscription, etc.) */
export interface Artifact {
  id: string;
  source: DataSource;
  type: ArtifactType;
  title: string;
  description?: string;
  url?: string;
  createdAt?: string; // ISO 8601
  modifiedAt?: string; // ISO 8601
  metadata: Record<string, unknown>;
}

/** Unified graph of all discovered entities */
export interface EntityGraph {
  people: Person[];
  moments: Moment[];
  artifacts: Artifact[];
}

/** Raw result from a single ingestion worker (before entity resolution) */
export interface IngestionResult {
  source: DataSource;
  people: Person[];
  moments: Moment[];
  artifacts: Artifact[];
}
