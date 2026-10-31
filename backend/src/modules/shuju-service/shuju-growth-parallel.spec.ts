import { ShujuGrowthReadService } from './shuju-growth-read.service';
import { PrismaService } from '@/prisma/prisma.service';
import * as traffic from './shuju-traffic-filter';
import * as content from './shuju-content-growth';
import * as review from './shuju-traffic-review';

it('starts independent summaries before a slower summary completes', async () => {
  let releaseSessions!: (value: string[]) => void;
  let releaseContent!: (value: never) => void;
  let contentStarted!: () => void;
  const entered = new Promise<void>(resolve => { contentStarted = resolve; });
  const sessionRead = new Promise<string[]>(resolve => { releaseSessions = resolve; });
  const contentRead = new Promise<never>(resolve => { releaseContent = resolve; });
  const sessions = jest.spyOn(traffic, 'readAutomatedSessions').mockReturnValue(sessionRead);
  const coverage = jest.spyOn(traffic, 'readTrafficCoverageStart').mockResolvedValue(null);
  const contents = jest.spyOn(content, 'readContentGrowth').mockImplementation(() => {
    contentStarted();
    return contentRead;
  });
  const reviews = jest.spyOn(review, 'readTrafficReview').mockResolvedValue({} as never);
  try {
    const prisma = { $queryRaw: jest.fn().mockResolvedValue([]) } as unknown as PrismaService;
    const running = new ShujuGrowthReadService(prisma).overview({
      startDate: '2026-09-16', endDate: '2026-10-15', responseProfile: 'dashboard',
    });
    expect(sessions).toHaveBeenCalledTimes(1);
    expect(coverage).toHaveBeenCalledTimes(2);
    releaseSessions([]);
    await entered;
    expect(reviews).toHaveBeenCalledTimes(1);
    releaseContent({ version: 1, operating: {}, operatingSources: [], operatingSourceDetails: [] } as never);
    await expect(running).resolves.toMatchObject({ content: { version: 1 } });
  } finally {
    releaseSessions([]);
    releaseContent({} as never);
    sessions.mockRestore(); coverage.mockRestore(); contents.mockRestore(); reviews.mockRestore();
  }
});
