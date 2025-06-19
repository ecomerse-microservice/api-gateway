import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseSanitizerInterceptor<T> implements NestInterceptor<T, T> {
  private readonly logger = new Logger('ResponseInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    const contextType = context.getType(); // 'http', 'rpc', 'ws'
    this.logger.verbose(`[ ${contextType}] Intercepting response...`);

    return next.handle().pipe(
      map((data) => {
        // Currently just logs and passes through. Add sanitization if needed.
        this.logger.verbose(
          `[ ${contextType}] Passing through response data of type: ${typeof data}`,
        );
        return data;
      }),
    );
  }
}
