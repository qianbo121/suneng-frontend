import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { databaseFailure } from '@/common/utils/database-failure';

// A request the database could not serve is not a client mistake: these mean the
// database is unreachable, still starting, out of connections or timing out. They
// must answer 503 and always be logged, or a failing database silently looks like
// a stream of bad requests.

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : ((exceptionResponse as { message?: string | string[] }).message ?? 'Request failed');
    } else if (exception instanceof PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;

      if (exception.code === 'P2002') {
        message = 'Duplicate data exists';
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
      } else if (databaseFailure(exception)?.status === HttpStatus.SERVICE_UNAVAILABLE) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Service temporarily unavailable';
      } else {
        message = `Database error: ${exception.code}`;
      }
    } else if (exception instanceof PrismaClientInitializationError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Service temporarily unavailable';
    } else if (exception instanceof PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database request validation failed';
    }

    // Query strings on protected admin routes can contain phone numbers,
    // email addresses or customer requirement text. Never copy them into
    // application logs or retained error payloads.
    const safePath = request.path || request.url.split('?', 1)[0] || '/';

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const error = exception instanceof Error ? exception.stack : JSON.stringify(exception);
      this.logger.error(`${request.method} ${safePath}`, error);
    } else if (
      request.method === 'POST' &&
      /^\/api\/v[12]\/(?:custom-requirements|engineering-requirements)(?:\/attachments)?\/?$/.test(
        safePath,
      )
    ) {
      // A validation rejection must be observable, without logging the body,
      // query, or error message (all may contain customer-provided values).
      this.logger.warn(`Inquiry rejected: ${request.method} ${safePath} -> ${status}`);
    } else if (!(exception instanceof HttpException)) {
      // Database-shaped failures that legitimately stay 4xx (a unique constraint, an
      // unknown sort column) still deserve one line, or they are invisible afterwards.
      const name = exception instanceof Error ? exception.name : 'UnknownError';
      this.logger.warn(`${request.method} ${safePath} -> ${status} ${name}`);
    }

    response.status(status).json({
      code: status,
      data: {
        path: safePath,
        timestamp: new Date().toISOString(),
      },
      message,
    });
  }
}
