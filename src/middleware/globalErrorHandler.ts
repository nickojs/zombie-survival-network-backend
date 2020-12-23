import { NextFunction, Request, Response } from 'express';
import { Middleware, ExpressErrorMiddlewareInterface, HttpError } from 'routing-controllers';
import { QueryFailedError } from 'typeorm';

@Middleware({ type: 'after' })
export class GlobalErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, request: Request, response: Response, next: NextFunction) {
    // typeorm Handler
    const queryFailedGuard = (
      err: any
    ): err is QueryFailedError & { code: string } => err instanceof QueryFailedError;
    if (queryFailedGuard(error)) {
      switch (error.code) {
        case 'ER_DUP_ENTRY':
          return response.status(409).json({ message: 'Duplicated values' });
        default:
          break;
      }
    }

    // global handler
    return response.status(error.httpCode || 500).json({
      message: error?.message || 'Something went wrong'
    });
  }
}
