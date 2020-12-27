/* eslint-disable no-console */
import 'reflect-metadata';
import { Action, createExpressServer } from 'routing-controllers';
import { createConnection } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { UserController } from './controllers/UserController';
import { AuthController } from './controllers/AuthController';
import { GlobalErrorHandler } from './middleware/globalErrorHandler';

createConnection()
  .then(() => {
    const server = createExpressServer({
      currentUserChecker: async (action: Action) => {
        const token = action.request.headers.auth;
        if (!token) return null;
        const tokenData = jwt.decode(token, process.env.secret);
        return tokenData.userId;
      },
      cors: true,
      defaultErrorHandler: false,
      controllers: [UserController, AuthController],
      middlewares: [GlobalErrorHandler]
    });
    server.listen(3000, () => {
      console.log('server started at port 3000');
    });
  }).catch((e) => console.log('connection error: \n', e));
