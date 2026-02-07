import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import crypto from 'node:crypto';
import type { IngestionResult, Artifact, ArtifactType, Moment } from '@boggart/shared';

function mimeToArtifactType(mimeType: string): ArtifactType {
  if (mimeType.includes('document') || mimeType.includes('text')) return 'document';
  if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('slide')) return 'presentation';
  if (mimeType.includes('video')) return 'video';
  if (mimeType.includes('image')) return 'image';
  return 'other';
}

export async function ingestDrive(auth: OAuth2Client): Promise<IngestionResult> {
  try {
    const drive = google.drive({ version: 'v3', auth });

    const res = await drive.files.list({
      pageSize: 100,
      orderBy: 'modifiedTime desc',
      fields: 'files(id,name,mimeType,createdTime,modifiedTime,webViewLink)',
    });

    const files = res.data.files ?? [];
    const artifacts: Artifact[] = [];
    const moments: Moment[] = [];

    for (const file of files) {
      artifacts.push({
        id: crypto.randomUUID(),
        source: 'drive',
        type: mimeToArtifactType(file.mimeType || ''),
        title: file.name || 'Untitled',
        url: file.webViewLink ?? undefined,
        createdAt: file.createdTime ?? undefined,
        modifiedAt: file.modifiedTime ?? undefined,
        metadata: {
          fileId: file.id,
          mimeType: file.mimeType,
        },
      });

      moments.push({
        id: crypto.randomUUID(),
        source: 'drive',
        timestamp: file.modifiedTime
          ? new Date(file.modifiedTime).toISOString()
          : new Date().toISOString(),
        type: 'document_edit',
        summary: `Edited: ${file.name || 'Untitled'}`,
        peopleIds: [],
        metadata: {
          fileId: file.id,
          mimeType: file.mimeType,
        },
      });
    }

    return {
      source: 'drive',
      people: [],
      moments,
      artifacts,
    };
  } catch {
    return { source: 'drive', people: [], moments: [], artifacts: [] };
  }
}
