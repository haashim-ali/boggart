import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import crypto from 'node:crypto';
import type { IngestionResult, Artifact, Moment } from '@boggart/shared';

export async function ingestYoutube(auth: OAuth2Client): Promise<IngestionResult> {
  try {
    const youtube = google.youtube({ version: 'v3', auth });
    const artifacts: Artifact[] = [];
    const moments: Moment[] = [];

    // Subscriptions — paginate to get all
    let subPageToken: string | undefined;
    do {
      const subsRes = await youtube.subscriptions.list({
        mine: true,
        part: ['snippet'],
        maxResults: 50,
        pageToken: subPageToken,
      });

      for (const sub of subsRes.data.items ?? []) {
        const snippet = sub.snippet;
        if (!snippet) continue;

        artifacts.push({
          id: crypto.randomUUID(),
          source: 'youtube',
          type: 'channel',
          title: snippet.title || 'Unknown channel',
          description: snippet.description?.slice(0, 500) ?? undefined,
          url: snippet.resourceId?.channelId
            ? `https://www.youtube.com/channel/${snippet.resourceId.channelId}`
            : undefined,
          createdAt: snippet.publishedAt ?? undefined,
          metadata: {
            channelId: snippet.resourceId?.channelId,
          },
        });
      }

      subPageToken = subsRes.data.nextPageToken ?? undefined;
    } while (subPageToken);

    console.log(`[youtube] Found ${artifacts.length} subscriptions`);

    // Liked videos — paginate to get up to 200
    let likedPageToken: string | undefined;
    let likedCount = 0;
    const MAX_LIKED = 200;

    do {
      const likedRes = await youtube.videos.list({
        myRating: 'like',
        part: ['snippet', 'contentDetails'],
        maxResults: 50,
        pageToken: likedPageToken,
      });

      for (const video of likedRes.data.items ?? []) {
        const snippet = video.snippet;
        if (!snippet) continue;

        artifacts.push({
          id: crypto.randomUUID(),
          source: 'youtube',
          type: 'video',
          title: snippet.title || 'Unknown video',
          description: snippet.description?.slice(0, 500) ?? undefined,
          url: video.id ? `https://www.youtube.com/watch?v=${video.id}` : undefined,
          createdAt: snippet.publishedAt ?? undefined,
          metadata: {
            channelTitle: snippet.channelTitle,
            tags: snippet.tags?.slice(0, 10),
            categoryId: snippet.categoryId,
          },
        });

        moments.push({
          id: crypto.randomUUID(),
          source: 'youtube',
          timestamp: snippet.publishedAt
            ? new Date(snippet.publishedAt).toISOString()
            : new Date().toISOString(),
          type: 'video_interaction',
          summary: `Liked: ${snippet.title} (by ${snippet.channelTitle})`,
          peopleIds: [],
          metadata: {
            videoId: video.id,
            channelTitle: snippet.channelTitle,
            tags: snippet.tags?.slice(0, 10),
            description: snippet.description?.slice(0, 300),
          },
        });

        likedCount++;
      }

      likedPageToken = likedRes.data.nextPageToken ?? undefined;
    } while (likedPageToken && likedCount < MAX_LIKED);

    console.log(`[youtube] Found ${likedCount} liked videos`);

    return {
      source: 'youtube',
      people: [],
      moments,
      artifacts,
    };
  } catch (err) {
    console.error('[youtube] Worker failed:', err);
    return { source: 'youtube', people: [], moments: [], artifacts: [] };
  }
}
