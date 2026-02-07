import { google } from 'googleapis';
import type {
  PipelineStatus,
  PipelineWorkerName,
  PipelineWorkerState,
  IngestionResult,
  EntityGraph,
  Profile,
} from '@boggart/shared';
import { ingestGmail } from '../google/gmail';
import { ingestCalendar } from '../google/calendar';
import { ingestContacts } from '../google/contacts';
import { ingestYoutube } from '../google/youtube';
import { ingestDrive } from '../google/drive';
import { linkEntities } from './linker';
import { synthesise } from './synthesiser';
import { store } from '../db/store';

const pipelineStates = new Map<string, PipelineStatus>();

const workerNames: PipelineWorkerName[] = ['gmail', 'calendar', 'contacts', 'youtube', 'drive'];

function createInitialStatus(): PipelineStatus {
  return {
    stage: 'idle',
    workers: workerNames.map((name) => ({
      name,
      status: 'pending',
    })),
  };
}

export function getStatus(userId: string): PipelineStatus {
  return pipelineStates.get(userId) ?? createInitialStatus();
}

export function startPipeline(
  userId: string,
  accessToken: string,
  refreshToken?: string,
): void {
  const status = createInitialStatus();
  status.stage = 'ingesting';
  pipelineStates.set(userId, status);

  // Run async - don't await
  runPipeline(userId, accessToken, refreshToken).catch((err) => {
    const s = pipelineStates.get(userId);
    if (s) {
      s.stage = 'error';
      s.error = err instanceof Error ? err.message : 'Pipeline failed';
    }
  });
}

type WorkerFn = (auth: InstanceType<typeof google.auth.OAuth2>) => Promise<IngestionResult>;

const workerFns: Record<PipelineWorkerName, WorkerFn> = {
  gmail: ingestGmail,
  calendar: ingestCalendar,
  contacts: ingestContacts,
  youtube: ingestYoutube,
  drive: ingestDrive,
};

async function runPipeline(
  userId: string,
  accessToken: string,
  refreshToken?: string,
): Promise<void> {
  const status = pipelineStates.get(userId)!;

  // Create OAuth2 client with credentials
  const client = new google.auth.OAuth2();
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  // Run all workers
  const workerPromises = workerNames.map(async (name, index) => {
    const workerState = status.workers[index];
    workerState.status = 'running';

    try {
      const result = await workerFns[name](client);
      workerState.status = 'completed';
      workerState.itemCount =
        result.people.length + result.moments.length + result.artifacts.length;
      return result;
    } catch (err) {
      workerState.status = 'failed';
      workerState.error = err instanceof Error ? err.message : 'Worker failed';
      return { source: name, people: [], moments: [], artifacts: [] } as IngestionResult;
    }
  });

  const results = await Promise.allSettled(workerPromises);
  const ingestionResults = results.map((r) =>
    r.status === 'fulfilled'
      ? r.value
      : ({ source: 'gmail', people: [], moments: [], artifacts: [] } as IngestionResult),
  );

  // Link entities
  status.stage = 'linking';
  let graph: EntityGraph;
  try {
    graph = linkEntities(ingestionResults);
  } catch (err) {
    status.stage = 'error';
    status.error = err instanceof Error ? err.message : 'Linking failed';
    return;
  }

  // Synthesize profile
  status.stage = 'synthesizing';
  let profile: Profile;
  try {
    profile = await synthesise(userId, graph);
  } catch (err) {
    status.stage = 'error';
    status.error = err instanceof Error ? err.message : 'Synthesis failed';
    return;
  }

  // Store results
  store.upsert(userId, profile, graph);
  status.stage = 'complete';
}
