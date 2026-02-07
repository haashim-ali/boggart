import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import crypto from 'node:crypto';
import type { IngestionResult, Artifact, Moment } from '@boggart/shared';

export async function ingestYoutube(auth: OAuth2Client): Promise<IngestionResult> {
  try {
    const youtube = google.youtube({ version: 'v3', auth });
    const artifacts: Artifact[] = [];
    const moments: Moment[] = [];

    // Subscriptions
    const subsRes = await youtube.subscriptions.list({
      mine: true,
      part: ['snippet'],
      maxResults: 50,
    });

    for (const sub of subsRes.data.items ?? []) {
      const snippet = sub.snippet;
      if (!snippet) continue;

      artifacts.push({
        id: crypto.randomUUID(),
        source: 'youtube',
        type: 'channel',
        title: snippet.title || 'Unknown channel',
        description: snippet.description ?? undefined,
        url: snippet.resourceId?.channelId
          ? `https://www.youtube.com/channel/${snippet.resourceId.channelId}`
          : undefined,
        createdAt: snippet.publishedAt ?? undefined,
        metadata: {
          channelId: snippet.resourceId?.channelId,
          thumbnails: snippet.thumbnails,
        },
      });
    }

    // Liked videos
    const likedRes = await youtube.videos.list({
      myRating: 'like',
      part: ['snippet'],
      maxResults: 50,
    });

    for (const video of likedRes.data.items ?? []) {
      const snippet = video.snippet;
      if (!snippet) continue;

      artifacts.push({
        id: crypto.randomUUID(),
        source: 'youtube',
        type: 'video',
        title: snippet.title || 'Unknown video',
        description: snippet.description ?? undefined,
        url: video.id ? `https://www.youtube.com/watch?v=${video.id}` : undefined,
        createdAt: snippet.publishedAt ?? undefined,
        metadata: {
          channelTitle: snippet.channelTitle,
          tags: snippet.tags,
        },
      });

      moments.push({
        id: crypto.randomUUID(),
        source: 'youtube',
        timestamp: snippet.publishedAt
          ? new Date(snippet.publishedAt).toISOString()
          : new Date().toISOString(),
        type: 'video_interaction',
        summary: `Liked: ${snippet.title}`,
        peopleIds: [],
        metadata: {
          videoId: video.id,
          channelTitle: snippet.channelTitle,
        },
      });
    }

    return {
      source: 'youtube',
      people: [],
      moments,
      artifacts,
    };
  } catch {
    return { source: 'youtube', people: [], moments: [], artifacts: [] };
  }
}
