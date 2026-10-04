import { PrismaClient } from '@prisma/client';
import { backfillNewsItems } from '../../../scripts/backfill-baidu-news-submit';

describe('Baidu backfill marker and process status', () => {
  const oldExit = process.exitCode;
  let fetchMock: jest.SpyInstance;
  beforeEach(() => {
    process.exitCode = undefined;
    fetchMock = jest.spyOn(globalThis, 'fetch');
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.replaceProperty(process, 'env', {
      ...process.env,
      BAIDU_SITE: 'jssngyl.cn',
      BAIDU_TOKEN: 'test-token',
    });
  });
  afterEach(() => {
    jest.restoreAllMocks();
    process.exitCode = oldExit;
  });
  const item = { id: 123, slug: 'test-article' };
  function client() {
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });
    return { updateMany, prisma: { news: { updateMany } } as unknown as PrismaClient };
  }
  it('marks the accepted item only after an explicit one-URL acceptance', async () => {
    const { prisma, updateMany } = client();
    fetchMock.mockResolvedValue(new Response('{"success":1}'));
    await expect(backfillNewsItems(prisma, [item], true)).resolves.toEqual({
      successCount: 1,
      failureCount: 0,
    });
    expect(updateMany).toHaveBeenCalledTimes(1);
    expect(process.exitCode).toBeUndefined();
    expect(fetchMock.mock.calls[0][0].protocol).toBe('https:');
  });
  it.each(['{}', '{"success":0}', 'bad-json'])(
    'does not mark rejected items and exits nonzero: %s',
    async (text) => {
      const { prisma, updateMany } = client();
      fetchMock.mockResolvedValue(new Response(text));
      await expect(backfillNewsItems(prisma, [item], true)).resolves.toEqual({
        successCount: 0,
        failureCount: 1,
      });
      expect(updateMany).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    },
  );
  it('does not mark a TLS failure and redacts the failure output', async () => {
    const { prisma, updateMany } = client();
    fetchMock.mockRejectedValue(
      Object.assign(new Error('private-url test-token'), {
        cause: { code: 'ERR_TLS_CERT_ALTNAME_INVALID' },
      }),
    );
    await backfillNewsItems(prisma, [item], true);
    expect(updateMany).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
    expect(console.error).toHaveBeenCalledWith(
      'Failed 123: Baidu submit failed (tls_certificate: ERR_TLS_CERT_ALTNAME_INVALID)',
    );
  });
  it('keeps dry-run free of requests and marker writes', async () => {
    const { prisma, updateMany } = client();
    await backfillNewsItems(prisma, [item], false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
  });
});
