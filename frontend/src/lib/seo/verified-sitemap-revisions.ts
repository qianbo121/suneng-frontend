import revisions from './verified-sitemap-revisions.json';

type Revision = { modifiedOn: string; sourceCommit: string };
const byPath: Record<string, Revision> = revisions;

/** Preserve day-level release evidence without inventing a midnight timestamp. */
export function verifiedSitemapDay(value: string, now = new Date()): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || !Number.isFinite(now.getTime())) return undefined;
  if (parsed.toISOString().slice(0, 10) !== value || parsed > now) return undefined;
  return value;
}

/** Exact locale paths only: a Chinese revision never supplies an English date. */
export function getVerifiedSitemapLastModified(path: string, now = new Date()) {
  if (!Object.hasOwn(byPath, path)) return undefined;
  const revision = byPath[path];
  if (!/^[a-f0-9]{40}$/.test(revision.sourceCommit)) return undefined;
  return verifiedSitemapDay(revision.modifiedOn, now);
}
