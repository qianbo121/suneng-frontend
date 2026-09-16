import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { emptyQueue, validateQueue } from './search-submission-queue.mjs';

export function trustedRun(run, repository, path, requireSuccess = false) {
  return run.repository?.full_name === repository && run.head_repository?.full_name === repository &&
    run.head_branch === 'main' && run.path === path && run.status === 'completed' &&
    (!requireSuccess || run.conclusion === 'success') &&
    ['push', 'workflow_dispatch', 'schedule', 'workflow_run'].includes(run.event);
}

export async function restoreQueue({ artifacts, previousRuns, repository, currentRunId, runInfo, download }) {
  const byNewest = [...artifacts].sort((a, b) => b.id - a.id);
  let state;
  for (const artifact of byNewest.filter((item) => item.name.startsWith('search-queue-state-'))) {
    if (!trustedRun(await runInfo(artifact.workflow_run.id), repository, '.github/workflows/search-submission.yml')) continue;
    // Never fall back to an older state: that would replay accepted batches or lose new URLs.
    if (artifact.expired) throw new Error('Latest search queue expired; restore its backup before submitting');
    state = validateQueue(await download(artifact, 'search-queue.json'));
    break;
  }
  if (!state) {
    if (previousRuns.some((run) => String(run.id) !== String(currentRunId) && run.head_branch === 'main' && run.conclusion !== 'skipped')) {
      throw new Error('Search queue archive is missing after a previous run; refusing a silent reset');
    }
    state = emptyQueue();
  }
  const batches = [];
  for (const artifact of [...byNewest].reverse().filter((item) => item.name.startsWith('search-changes-'))) {
    if (state.sources.includes(String(artifact.id))) continue;
    if (!trustedRun(await runInfo(artifact.workflow_run.id), repository, '.github/workflows/deploy.yml', true)) continue;
    if (artifact.expired) throw new Error('An unprocessed deployment change list expired; restore it before submitting');
    batches.push({ id: String(artifact.id), urls: await download(artifact, 'changed-search-urls.json') });
  }
  return { state, batches };
}

async function main() {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository || '')) throw new Error('A valid repository is required');
  const api = (path, paginate = false) => JSON.parse(execFileSync('gh', ['api', ...(paginate ? ['--paginate', '--slurp'] : []), `repos/${repository}/${path}`], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }));
  const artifacts = api('actions/artifacts?per_page=100', true).flatMap((page) => page.artifacts);
  const previousRuns = api('actions/workflows/search-submission.yml/runs?branch=main&per_page=100', true).flatMap((page) => page.workflow_runs);
  const cache = new Map();
  const temp = mkdtempSync(join(tmpdir(), 'search-queue-'));
  const { state, batches } = await restoreQueue({
    artifacts, previousRuns, repository, currentRunId: process.env.GITHUB_RUN_ID,
    runInfo: async (id) => { if (!cache.has(id)) cache.set(id, api(`actions/runs/${id}`)); return cache.get(id); },
    download: async (artifact, filename) => {
      const file = join(temp, `${artifact.id}.zip`);
      writeFileSync(file, execFileSync('gh', ['api', `repos/${repository}/actions/artifacts/${artifact.id}/zip`], { maxBuffer: 16 * 1024 * 1024 }));
      return JSON.parse(execFileSync('unzip', ['-p', file, filename], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }));
    },
  });
  const dir = process.env.RUNNER_TEMP || '.';
  writeFileSync(join(dir, 'search-queue.json'), JSON.stringify(state, null, 2));
  writeFileSync(join(dir, 'search-batches.json'), JSON.stringify(batches, null, 2));
  console.log(`Restored ${state.pending.baidu.length} Baidu / ${state.pending.indexnow.length} IndexNow pending URLs; ${batches.length} new deployment batches.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Queue restore failed');
  process.exitCode = 1;
});
