import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<
  T,
  { code: number; data: T; message: string }
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<{ code: number; data: T; message: string }> {
    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === 'object' &&
          'code' in (data as Record<string, unknown>) &&
          'message' in (data as Record<string, unknown>) &&
          'data' in (data as Record<string, unknown>)
        ) {
          return data as unknown as { code: number; data: T; message: string };
        }

        return {
          code: 0,
          data,
          message: 'success',
        };
      }),
    );
  }
}
