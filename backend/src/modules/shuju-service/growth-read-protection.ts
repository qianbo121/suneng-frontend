import { ServiceUnavailableException } from '@nestjs/common';

function requestKey(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(requestKey).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${requestKey(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

/** Per-service read admission, not a cache or a new database connection pool.
 * The live shared pool has ten connections; an overview used to queue sixteen
 * queries at once. Keep reporting at two reads, leaving room for live writes.
 * Other processes can still exhaust the server, so never promise zero timeouts.
 */
export class GrowthReadProtection {
  private activeReads = 0;
  private readonly waiting: Array<() => void> = [];
  private readonly overviews = new Map<string, Promise<unknown>>();

  overview<T>(query: unknown, read: () => Promise<T>): Promise<T> {
    const key = requestKey(query);
    const pending = this.overviews.get(key);
    if (pending) return pending as Promise<T>;
    // Distinct reports share the bounded database queue below; do not add a
    // second admission limit that rejects a third otherwise valid report.
    // Coalesce only currently running, identical requests. Never reuse a stale
    // result after an inquiry review or return zero metrics when a read fails.
    const result = Promise.resolve()
      .then(read)
      .finally(() => this.overviews.delete(key));
    this.overviews.set(key, result);
    return result;
  }

  private schedule<T>(read: () => PromiseLike<T>): Promise<T> {
    if (this.activeReads >= 2 && this.waiting.length >= 64) {
      return Promise.reject(new ServiceUnavailableException('统计查询繁忙，请稍后重试'));
    }
    return new Promise<T>((resolve, reject) => {
      const start = () => {
        this.activeReads++;
        Promise.resolve()
          .then(read)
          .then(resolve, reject)
          .finally(() => {
            this.activeReads--;
            this.waiting.shift()?.();
          });
      };
      if (this.activeReads < 2) start();
      else this.waiting.push(start);
    });
  }

  database<T extends object>(database: T): T {
    return new Proxy(database, {
      get: (target, property) => {
        const method = Reflect.get(target, property, target);
        if (
          typeof method === 'function' &&
          (property === '$queryRaw' || property === '$transaction')
        ) {
          // Acquire one slot for the ENTIRE transaction. Its callback receives
          // the real transaction client, so nested reads never deadlock here.
          return (...args: unknown[]) =>
            this.schedule(async () => Reflect.apply(method, target, args));
        }
        return typeof method === 'function' ? method.bind(target) : method;
      },
    });
  }
}
