import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.getArgByIndex(0);
    console.log('Before...', res.originalUrl);

    // const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        // console.log(`After... ${Date.now() - now}ms`);
      }),
    );
  }
}
