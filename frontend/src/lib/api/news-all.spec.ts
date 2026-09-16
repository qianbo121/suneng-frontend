import { describe, expect, it, vi } from 'vitest';
import { safeApiGet } from './client';
import { getAllNewsForDecisionCenter } from './news';
vi.mock('./client', () => ({ safeApiGet: vi.fn() }));
describe('complete article collection', () => {
  it('reads beyond 100 and does not return partial data on failure', async () => {
    const api = vi.mocked(safeApiGet);
    api
      .mockResolvedValueOnce({
        data: { items: Array.from({ length: 100 }, (_, id) => ({ id })), total: 101 },
        error: null,
      })
      .mockResolvedValueOnce({ data: { items: [{ id: 100 }], total: 101 }, error: null });
    expect((await getAllNewsForDecisionCenter()).data).toHaveLength(101);
    expect(api.mock.calls[1][1]).toMatchObject({
      cache: 'no-store',
      searchParams: { page: 2, pageSize: 100 },
    });
    api
      .mockResolvedValueOnce({ data: { items: [{ id: 1 }], total: 2 }, error: null })
      .mockResolvedValueOnce({ data: null, error: 'offline' });
    expect(await getAllNewsForDecisionCenter()).toEqual({ data: null, error: 'offline' });
  });
});
