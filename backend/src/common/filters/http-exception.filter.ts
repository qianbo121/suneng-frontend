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
      } else {
        message = `Database error: ${exception.code}`;
      }
    } else if (
      exception instanceof PrismaClientValidationError ||
      exception instanceof PrismaClientInitializationError
    ) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database request validation failed';
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const error = exception instanceof Error ? exception.stack : JSON.stringify(exception);
      this.logger.error(`${request.method} ${request.url}`, error);
    }

    response.status(status).json({
      code: status,
      data: {
        path: request.url,
        timestamp: new Date().toISOString(),
      },
      message,
    });
  }
}
