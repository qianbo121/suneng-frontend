import { describe, expect, it } from 'vitest';

import {
  createLatestTargetRequestGuard,
  runLatestTargetRequest,
} from '@/pages/content/latest-target-request';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

type AuditState = {
  targetId: number | null;
  rows: string[];
  error: string;
  loading: boolean;
};

function runAuditRequest(
  state: AuditState,
  guard: ReturnType<typeof createLatestTargetRequestGuard>,
  targetId: number,
  request: Promise<string[]>,
) {
  state.targetId = targetId;
  return runLatestTargetRequest({
    guard,
    targetId,
    request: () => request,
    onStart: () => {
      state.rows = [];
      state.error = '';
      state.loading = true;
    },
    onSuccess: (rows) => {
      state.rows = rows;
    },
    onError: (error) => {
      state.rows = [];
      state.error = error instanceof Error ? error.message : String(error);
    },
    onSettled: () => {
      state.loading = false;
    },
  });
}

describe('latest notification-audit request guard', () => {
  it('does not let a late A success overwrite the already rendered B rows', async () => {
    const guard = createLatestTargetRequestGuard();
    const state: AuditState = { targetId: null, rows: [], error: '', loading: false };
    const a = deferred<string[]>();
    const b = deferred<string[]>();

    const aRun = runAuditRequest(state, guard, 1, a.promise);
    const bRun = runAuditRequest(state, guard, 2, b.promise);
    b.resolve(['B record']);
    await bRun;
    expect(state).toEqual({ targetId: 2, rows: ['B record'], error: '', loading: false });

    a.resolve(['A record']);
    await aRun;
    expect(state).toEqual({ targetId: 2, rows: ['B record'], error: '', loading: false });
  });

  it('does not let a stale A failure or finally clear B loading and rows', async () => {
    const guard = createLatestTargetRequestGuard();
    const state: AuditState = { targetId: null, rows: [], error: '', loading: false };
    const a = deferred<string[]>();
    const b = deferred<string[]>();

    const aRun = runAuditRequest(state, guard, 1, a.promise);
    const bRun = runAuditRequest(state, guard, 2, b.promise);
    a.reject(new Error('A failed late'));
    await aRun;
    expect(state).toEqual({ targetId: 2, rows: [], error: '', loading: true });

    b.resolve(['B record']);
    await bRun;
    expect(state).toEqual({ targetId: 2, rows: ['B record'], error: '', loading: false });
  });

  it('invalidates an open request when the audit dialog closes', async () => {
    const guard = createLatestTargetRequestGuard();
    const state: AuditState = { targetId: null, rows: [], error: '', loading: false };
    const a = deferred<string[]>();
    const aRun = runAuditRequest(state, guard, 1, a.promise);

    guard.invalidate();
    state.targetId = null;
    state.rows = [];
    state.error = '';
    state.loading = false;
    a.resolve(['A record']);
    await aRun;

    expect(state).toEqual({ targetId: null, rows: [], error: '', loading: false });
  });
});
