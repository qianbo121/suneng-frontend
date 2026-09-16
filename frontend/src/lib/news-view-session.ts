const KEY = 'suneng-news-viewed-session';
const completed = new Set<number>();
const inFlight = new Map<number, Promise<void>>();

type Store = Pick<Storage, 'getItem' | 'setItem'>;

export function isPublicNewsView(
  pathname: string,
  search: string,
  visible: boolean,
  prerendering = false,
) {
  const params = new URLSearchParams(search);
  return (
    visible &&
    !prerendering &&
    /^\/(zh|en)\/news\/[^/]+\/?$/.test(pathname) &&
    !['preview', 'draft', 'adminPreview'].some((key) => params.has(key))
  );
}

// This stores only a deduplication receipt. All counts remain in the server database.
export function registerNewsSessionView(
  id: number,
  storage: Store | undefined,
  send: () => Promise<boolean>,
) {
  let viewed: number[] = [];
  try {
    viewed = JSON.parse(storage?.getItem(KEY) || '[]');
  } catch {
    /* unavailable storage */
  }
  if (!Array.isArray(viewed)) viewed = [];
  if (completed.has(id) || viewed.includes(id)) return Promise.resolve();
  const pending = inFlight.get(id);
  if (pending) return pending;
  const request = Promise.resolve()
    .then(send)
    .then((ok) => {
      if (!ok) return;
      completed.add(id);
      try {
        const existing = JSON.parse(storage?.getItem(KEY) || '[]');
        storage?.setItem(
          KEY,
          JSON.stringify([...new Set([...(Array.isArray(existing) ? existing : []), id])]),
        );
      } catch {
        /* memory still deduplicates this document */
      }
    })
    .catch(() => {})
    .finally(() => {
      inFlight.delete(id);
    });
  inFlight.set(id, request);
  return request;
}
