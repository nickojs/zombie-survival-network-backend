import { NextFunction, Request, Response } from 'express';
import HttpError from '../helpers/httpError';

function errorMiddleware(
  error: HttpError, request: Request, response: Response, next: NextFunction
) {
  const status = error.code || 500;
  const message = error.message || 'Something went wrong';
  response
    .status(status)
    .send({
      status,
      message
    });
}

export default errorMiddleware;
