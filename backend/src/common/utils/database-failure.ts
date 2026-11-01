import { HttpStatus } from '@nestjs/common';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

const UNAVAILABLE_CODES = new Set([
  'P1000',
  'P1001',
  'P1002',
  'P1008',
  'P1017',
  'P2024',
  'P2028',
  'P2034',
]);

/** Public status and bounded diagnostics only: never include a database message. */
export function databaseFailure(error: unknown) {
  if (error instanceof PrismaClientKnownRequestError) {
    const unavailable = UNAVAILABLE_CODES.has(error.code);
    return {
      status: unavailable
        ? HttpStatus.SERVICE_UNAVAILABLE
        : error.code === 'P2025'
          ? HttpStatus.NOT_FOUND
          : HttpStatus.BAD_REQUEST,
      code: /^P\d{4}$/.test(error.code) ? error.code : 'DATABASE_ERROR',
      retryable: unavailable,
    };
  }
  if (error instanceof PrismaClientInitializationError) {
    return {
      status: HttpStatus.SERVICE_UNAVAILABLE,
      code: 'DATABASE_INITIALIZATION',
      retryable: true,
    };
  }
  if (error instanceof PrismaClientValidationError) {
    return { status: HttpStatus.BAD_REQUEST, code: 'DATABASE_VALIDATION', retryable: false };
  }
  return null;
}
