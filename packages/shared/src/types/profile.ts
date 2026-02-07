/** The full synthesized psychological profile of a user */
export interface Profile {
  userId: string;
  generatedAt: string; // ISO 8601
  identity: Identity;
  relationships: Relationship[];
  psychology: Psychology;
  interests: Interest[];
  communication: CommunicationStyle;
  routines: Routine[];
  values: string[];
  summary: string;
}

/** Core identity information inferred from data */
export interface Identity {
  name: string;
  inferredAgeRange?: string;
  occupation?: string;
  location?: string;
  selfDescription: string;
}

/** Relationship types we can infer */
export type RelationshipType =
  | 'family'
  | 'friend'
  | 'colleague'
  | 'acquaintance'
  | 'other';

/** A relationship with another person */
export interface Relationship {
  personName: string;
  type: RelationshipType;
  closeness: number; // 1-10
  context: string;
}

/** Psychological profile derived from behavioral data */
export interface Psychology {
  bigFive: BigFiveTraits;
  motivations: string[];
  fears: string[];
  decisionStyle: string;
  emotionalPatterns: string[];
}

/** Big Five personality traits, each normalized 0-1 */
export interface BigFiveTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

/** A topic of interest with supporting evidence */
export interface Interest {
  topic: string;
  intensity: number; // 1-10
  evidence: string[];
}

/** How the user tends to communicate */
export interface CommunicationStyle {
  formality: number; // 1-10
  verbosity: number; // 1-10
  humorStyle: string;
  preferredChannels: string[];
  notablePatterns: string[];
}

/** A recurring behavioral pattern */
export interface Routine {
  description: string;
  frequency: string;
  timeOfDay?: string;
  evidence: string[];
}
