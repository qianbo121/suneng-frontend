// One storage key per fact: tabs never overwrite a shared queue snapshot. Replays
// keep the original payload; the receiver deduplicates its collection ID.
export const COLLECTION_OUTBOX_PREFIX = 'suneng_collection_pending_v1:';
export const COLLECTION_RETENTION_MS = 24 * 60 * 60 * 1000;
const MAX_RECORDS = 100;
const MAX_RECORD_BYTES = 12_000;
const MAX_TOTAL_BYTES = 512_000;
const RETRY_DELAYS = [10_000, 30_000, 60_000, 300_000];

type Entry<T> = { payload: T; savedAt: number; expiresAt: number };

export function createCollectionOutbox<T>(options: {
  owner: Window;
  storage: () => Storage | undefined;
  valid: (value: unknown) => value is T;
  id: (payload: T) => string;
  send: (payload: T) => Promise<boolean>;
}) {
  const { owner } = options;
  const entries = new Map<string, Entry<T>>();
  const inFlight = new Map<string, Promise<boolean>>();
  const retry = new Map<string, { at: number; failures: number }>();
  let timer: number | undefined;
  let disposed = false;
  let listening = false;

  function remove(id: string) {
    entries.delete(id);
    retry.delete(id);
    try {
      options.storage()?.removeItem(COLLECTION_OUTBOX_PREFIX + id);
    } catch {
      /* memory only */
    }
  }

  function restore() {
    try {
      const storage = options.storage();
      if (!storage) return;
      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key?.startsWith(COLLECTION_OUTBOX_PREFIX)) keys.push(key);
      }
      for (const key of keys) {
        const id = key.slice(COLLECTION_OUTBOX_PREFIX.length);
        try {
          const raw = storage.getItem(key) || '';
          if (new TextEncoder().encode(raw).length > MAX_RECORD_BYTES) throw new Error('oversized');
          const entry = JSON.parse(raw) as Entry<T>;
          if (
            !options.valid(entry.payload) ||
            options.id(entry.payload) !== id ||
            !Number.isFinite(entry.savedAt) ||
            !Number.isFinite(entry.expiresAt) ||
            entry.savedAt > Date.now() ||
            entry.expiresAt <= Date.now() ||
            entry.expiresAt - entry.savedAt !== COLLECTION_RETENTION_MS
          )
            throw new Error('invalid');
          if (!entries.has(id)) entries.set(id, entry);
        } catch {
          remove(id);
        }
      }
    } catch {
      /* Storage denial must not stop current-page collection. */
    }
    trim();
  }

  function trim() {
    let bytes = 0,
      count = 0;
    // Prefer the oldest outstanding facts, including the visit's first page.
    for (const [id, entry] of [...entries].sort((a, b) => a[1].savedAt - b[1].savedAt)) {
      const size = new TextEncoder().encode(JSON.stringify(entry)).length;
      if (entry.expiresAt <= Date.now() || count >= MAX_RECORDS || bytes + size > MAX_TOTAL_BYTES) {
        remove(id);
      } else {
        count++;
        bytes += size;
      }
    }
  }

  function schedule() {
    if (timer !== undefined) owner.clearTimeout(timer);
    timer = undefined;
    if (disposed || inFlight.size >= 4) return;
    trim();
    const waiting = [...entries].filter(([id]) => !inFlight.has(id));
    if (!waiting.length) return;
    const next = Math.min(
      ...waiting.map(([id, entry]) => Math.min(entry.expiresAt, retry.get(id)?.at ?? Date.now())),
    );
    timer = owner.setTimeout(
      () => {
        timer = undefined;
        flush();
      },
      Math.max(100, next - Date.now()),
    );
  }

  function attempt(id: string): Promise<boolean> {
    const active = inFlight.get(id);
    if (active) return active;
    const entry = entries.get(id);
    if (!entry || disposed) return Promise.resolve(false);
    if (entry.expiresAt <= Date.now()) {
      remove(id);
      return Promise.resolve(false);
    }
    // Bound aggregate keepalive bodies and recovery work after a long outage.
    if (inFlight.size >= 4) {
      schedule();
      return Promise.resolve(false);
    }
    // Persist BEFORE initiating the request, including when storage has recovered.
    try {
      options.storage()?.setItem(COLLECTION_OUTBOX_PREFIX + id, JSON.stringify(entry));
    } catch {
      /* memory only */
    }
    const sending = options
      .send(entry.payload)
      .then(
        (accepted) => {
          if (disposed) return accepted;
          if (accepted) remove(id);
          else {
            const previous = retry.get(id);
            if (!previous || previous.at <= Date.now()) {
              const failures = (previous?.failures ?? 0) + 1;
              retry.set(id, {
                failures,
                at: Date.now() + RETRY_DELAYS[Math.min(failures - 1, RETRY_DELAYS.length - 1)],
              });
            }
          }
          return accepted;
        },
        () => {
          if (!disposed) retry.set(id, { failures: 1, at: Date.now() + RETRY_DELAYS[0] });
          return false;
        },
      )
      .finally(() => {
        inFlight.delete(id);
        schedule();
      });
    inFlight.set(id, sending);
    return sending;
  }

  function flush(force = false) {
    if (disposed) return;
    restore();
    for (const [id] of entries) {
      if (inFlight.size >= 4) break;
      if (force || (retry.get(id)?.at ?? 0) <= Date.now()) void attempt(id);
    }
    schedule();
  }

  const resume = () => flush(true);
  return {
    start() {
      if (listening || disposed) return;
      listening = true;
      for (const event of ['online', 'pageshow', 'pagehide'])
        owner.addEventListener?.(event, resume);
      restore();
      schedule();
    },
    post(payload: T) {
      const id = options.id(payload);
      restore();
      if (!entries.has(id)) {
        const entry = {
          payload,
          savedAt: Date.now(),
          expiresAt: Date.now() + COLLECTION_RETENTION_MS,
        };
        if (new TextEncoder().encode(JSON.stringify(entry)).length > MAX_RECORD_BYTES)
          return options.send(payload);
        entries.set(id, entry);
        trim();
        // Full outbox: still attempt the new fact; don't evict the first page.
        if (!entries.has(id)) return options.send(payload);
      }
      try {
        options.storage()?.setItem(COLLECTION_OUTBOX_PREFIX + id, JSON.stringify(entries.get(id)));
      } catch {
        /* current-document fallback remains available */
      }
      return attempt(id);
    },
    dispose() {
      disposed = true;
      if (timer !== undefined) owner.clearTimeout(timer);
      for (const event of ['online', 'pageshow', 'pagehide'])
        owner.removeEventListener?.(event, resume);
    },
  };
}
