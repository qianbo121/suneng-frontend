import { ArgumentsHost, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';

describe('HttpExceptionFilter privacy boundary', () => {
  it('never copies protected admin search queries into logs or error payloads', () => {
    const request = {
      method: 'GET',
      path: '/api/admin/custom-requirements',
      url: '/api/admin/custom-requirements?keyword=buyer%40example.com%2013800000000',
    } as Request;
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { status } as unknown as Response;
    const host = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;
    const logError = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    new HttpExceptionFilter().catch(new Error('database unavailable'), host);

    expect(logError).toHaveBeenCalledWith('GET /api/admin/custom-requirements', expect.any(String));
    expect(JSON.stringify(logError.mock.calls)).not.toContain('buyer%40example.com');
    expect(JSON.stringify(logError.mock.calls)).not.toContain('13800000000');
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ path: '/api/admin/custom-requirements' }),
      }),
    );
  });
});
