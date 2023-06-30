import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

// TODO
@Injectable()
// implements NestInterceptor<T, Response<T>>
export class TransformInterceptor<T> implements NestInterceptor<T, T> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<T> {
    // ): Observable<Response<T>> {
    const res = context.getArgByIndex(1);
    console.log('map', res);
    return next.handle().pipe(map((data) => data));
  }
}
