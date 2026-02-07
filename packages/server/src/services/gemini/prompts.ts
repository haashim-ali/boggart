import type { EntityGraph, Profile, Strategy } from '@boggart/shared';

export function buildSynthesisPrompt(graph: EntityGraph, userId: string, condensedText?: string): string {
  const dataSection = condensedText
    ? `ANALYZED DATA (AI-condensed summaries from raw data — use these as your PRIMARY source):

${condensedText}

RAW ENTITY COUNTS (for additional context):
- ${graph.people.length} contacts discovered
- ${graph.moments.length} events/interactions
- ${graph.artifacts.length} digital artifacts`
    : `DATA:
- People they interact with (${graph.people.length} contacts): ${JSON.stringify(graph.people.slice(0, 50))}
- Life moments (${graph.moments.length} events): ${JSON.stringify(graph.moments.slice(0, 100))}
- Digital artifacts (${graph.artifacts.length} items): ${JSON.stringify(graph.artifacts.slice(0, 50))}`;

  return `You are a psychological profiler. Analyze the following data about a person and generate a comprehensive psychological profile.

${dataSection}

Generate a JSON Profile object with this exact structure:
{
  "userId": "${userId}",
  "generatedAt": "${new Date().toISOString()}",
  "identity": { "name": string, "inferredAgeRange": string?, "occupation": string?, "location": string?, "selfDescription": string },
  "relationships": [{ "personName": string, "type": "family"|"friend"|"colleague"|"acquaintance"|"other", "closeness": 1-10, "context": string }],
  "psychology": {
    "bigFive": { "openness": 0-1, "conscientiousness": 0-1, "extraversion": 0-1, "agreeableness": 0-1, "neuroticism": 0-1 },
    "motivations": string[],
    "fears": string[],
    "decisionStyle": string,
    "emotionalPatterns": string[]
  },
  "interests": [{ "topic": string, "intensity": 1-10, "evidence": string[] }],
  "communication": { "formality": 1-10, "verbosity": 1-10, "humorStyle": string, "preferredChannels": string[], "notablePatterns": string[] },
  "routines": [{ "description": string, "frequency": string, "timeOfDay": string?, "evidence": string[] }],
  "values": string[],
  "summary": string
}

Return ONLY valid JSON matching this structure.`;
}

export function buildStrategyPrompt(profile: Profile, goal: string): string {
  return `You are an advertising strategist. Given the following psychological profile and advertising goal, create a persuasion strategy.

PROFILE SUMMARY: ${profile.summary}
PSYCHOLOGY: ${JSON.stringify(profile.psychology)}
INTERESTS: ${JSON.stringify(profile.interests)}
COMMUNICATION STYLE: ${JSON.stringify(profile.communication)}
VALUES: ${JSON.stringify(profile.values)}

ADVERTISING GOAL: ${goal}

Generate a JSON Strategy object with this exact structure:
{
  "targetSummary": string,
  "goal": string,
  "persuasionApproach": string,
  "emotionalHooks": string[],
  "personalReferences": string[],
  "tone": string,
  "callToAction": string
}

Return ONLY valid JSON matching this structure.`;
}

export function buildVisualPrompt(profile: Profile, strategy: Strategy, goal: string): string {
  return `You are a creative director. Design a visual concept for a personalized ad.

TARGET PROFILE: ${profile.summary}
INTERESTS: ${JSON.stringify(profile.interests.slice(0, 5))}
STRATEGY: ${JSON.stringify(strategy)}
GOAL: ${goal}

Generate a JSON VisualConcept object with this exact structure:
{
  "description": string,
  "style": string,
  "colorPalette": string[],
  "personalElements": string[],
  "imagePrompt": string
}

Return ONLY valid JSON matching this structure.`;
}

export function buildCopyPrompt(profile: Profile, strategy: Strategy, goal: string): string {
  return `You are an ad copywriter. Write personalized ad copy.

TARGET PROFILE: ${profile.summary}
COMMUNICATION STYLE: ${JSON.stringify(profile.communication)}
STRATEGY: ${JSON.stringify(strategy)}
GOAL: ${goal}

Generate a JSON Copy object with this exact structure:
{
  "headline": string,
  "body": string (MUST be under 50 words),
  "personalHooks": string[]
}

Return ONLY valid JSON matching this structure. The body MUST be under 50 words.`;
}

export function buildVideoPrompt(profile: Profile, strategy: Strategy, goal: string): string {
  return `You are a video ad director. Create a short video script (6-10 seconds).

TARGET PROFILE: ${profile.summary}
INTERESTS: ${JSON.stringify(profile.interests.slice(0, 5))}
STRATEGY: ${JSON.stringify(strategy)}
GOAL: ${goal}

Generate a JSON VideoScript object with this exact structure:
{
  "duration": string (e.g. "8 seconds"),
  "shots": [{ "description": string, "duration": string, "movement": string, "overlayText": string? }],
  "mood": string,
  "music": string,
  "narration": string?
}

The total duration should be 6-10 seconds. Return ONLY valid JSON matching this structure.`;
}
