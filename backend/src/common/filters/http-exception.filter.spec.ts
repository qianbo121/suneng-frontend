import { ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime/library';

import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';

function capture(exception: unknown, path = '/api/v2/custom-requirements') {
  const request = { method: 'POST', path, url: path } as Request;
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const response = { status } as unknown as Response;
  const host = {
    switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }),
  } as unknown as ArgumentsHost;
  new HttpExceptionFilter().catch(exception, host);
  return { status, json };
}

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

describe('HttpExceptionFilter database availability', () => {
  let logError: jest.SpyInstance;
  let logWarn: jest.SpyInstance;

  beforeEach(() => {
    logError = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    logWarn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    logError.mockRestore();
    logWarn.mockRestore();
  });

  // An inquiry that cannot be stored must never look like a client mistake.
  it.each(['P1001', 'P1017', 'P2024'])(
    'answers 503 and logs when the database fails with %s',
    (code) => {
      const { status, json } = capture(
        new PrismaClientKnownRequestError('connection lost', { code, clientVersion: 'test' }),
      );
      expect(status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Service temporarily unavailable',
        }),
      );
      expect(logError).toHaveBeenCalled();
    },
  );

  it('answers 503 and logs when the client cannot initialise', () => {
    const { status } = capture(
      new PrismaClientInitializationError('cannot reach database', 'test'),
    );
    expect(status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    expect(logError).toHaveBeenCalled();
  });

  it('keeps a duplicate submission a client error but still records one line', () => {
    const { status } = capture(
      new PrismaClientKnownRequestError('duplicate', { code: 'P2002', clientVersion: 'test' }),
    );
    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(logError).not.toHaveBeenCalled();
    expect(logWarn).toHaveBeenCalledWith(expect.stringContaining('-> 400'));
  });

  it('keeps a missing record a 404', () => {
    const { status } = capture(
      new PrismaClientKnownRequestError('missing', { code: 'P2025', clientVersion: 'test' }),
    );
    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });
});
