import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  cache: (fn: unknown) => fn,
}));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw Object.assign(new Error('not found'), { withdrawn: true });
  },
  permanentRedirect: () => {
    throw new Error('redirect');
  },
  redirect: () => {
    throw new Error('redirect');
  },
  usePathname: () => '/zh',
}));

const app = path.join(process.cwd(), 'src/app/[locale]');
const guarded = ['solutions', 'articles'].flatMap((section) =>
  fs
    .readdirSync(path.join(app, section), { recursive: true, encoding: 'utf8' })
    .filter((file) => /(^|\/)(page|layout)\.tsx$/.test(file))
    .map((file) => path.join(section, file))
    .sort(),
);

describe('withdrawn sections render nothing, even without the middleware', () => {
  it('covers every page and layout under the withdrawn sections', () => {
    expect(guarded).toHaveLength(20);
  });

  it.each(guarded.flatMap((file) => ['zh', 'en'].map((locale) => [file, locale])))(
    '%s refuses to render in %s',
    async (file, locale) => {
      const page = await import(path.join(app, file));
      const props = { params: Promise.resolve({ locale }), children: null };
      await expect(Promise.resolve().then(() => page.default(props))).rejects.toMatchObject({ withdrawn: true });
      if (page.generateMetadata)
        await expect(Promise.resolve().then(() => page.generateMetadata(props))).rejects.toMatchObject({ withdrawn: true });
    },
  );
});
