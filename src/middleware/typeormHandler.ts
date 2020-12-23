import { NextFunction, Request, Response } from 'express';
import { Middleware, ExpressErrorMiddlewareInterface, HttpError } from 'routing-controllers';
import { QueryFailedError } from 'typeorm';

@Middleware({ type: 'after' })
export class TypeORMErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, request: Request, response: Response, next: NextFunction) {
    const queryFailedGuard = (
      err: any
    ): err is QueryFailedError & { code: string } => err instanceof QueryFailedError;

    if (queryFailedGuard(error)) {
      switch (error.code) {
        case 'ER_DUP_ENTRY':
          throw new HttpError(409, 'Duplicated values');
        default:
          break;
      }
    }

    next();
  }
}
