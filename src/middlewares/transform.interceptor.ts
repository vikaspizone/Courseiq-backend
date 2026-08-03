import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from './api-response';

import { trans } from '../utils/trans';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((resBody) => {
        // Handle standard null/undefined response body
        if (resBody === undefined || resBody === null) {
          return new ApiResponse(statusCode, null, trans('common.success'));
        }

        let message = 'common.success';
        let data = resBody;

        // If the return object already has a message and/or data fields
        if (resBody && typeof resBody === 'object') {
          if ('message' in resBody && 'data' in resBody) {
            message = resBody.message;
            data = resBody.data;
          } else if ('message' in resBody && Object.keys(resBody).length === 1) {
            message = resBody.message;
            data = null;
          }
        }

        return new ApiResponse(statusCode, data, trans(message));
      }),
    );
  }
}
