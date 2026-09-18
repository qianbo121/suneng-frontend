import { HttpStatus } from '@nestjs/common';

import { AppController } from './app.controller';

type ResponseStub = { status: jest.Mock };

function build(query: () => Promise<unknown>) {
  const prisma = { $queryRaw: jest.fn(query) } as never;
  const controller = new AppController(prisma);
  const response: ResponseStub = { status: jest.fn() };
  return { controller, response, prisma };
}

describe('AppController health', () => {
  it('reports ok only when the database answers', async () => {
    const { controller, response } = build(async () => [{ '?column?': 1 }]);
    const body = await controller.getHealth(response as never);
    expect(body).toMatchObject({ service: 'backend', status: 'ok', database: 'up' });
    expect(response.status).not.toHaveBeenCalled();
  });

  it('answers 503 and reports the database down when the query fails', async () => {
    const { controller, response } = build(async () => {
      throw new Error('connection refused');
    });
    const body = await controller.getHealth(response as never);
    expect(body).toMatchObject({ status: 'degraded', database: 'down' });
    expect(response.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
  });

  it('does not hang when the database never answers', async () => {
    jest.useFakeTimers();
    try {
      const { controller, response } = build(() => new Promise(() => {}));
      const pending = controller.getHealth(response as never);
      await jest.advanceTimersByTimeAsync(2500);
      const body = await pending;
      expect(body).toMatchObject({ status: 'degraded', database: 'down' });
      expect(response.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    } finally {
      jest.useRealTimers();
    }
  });
});
