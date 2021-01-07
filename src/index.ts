/* eslint-disable no-console */
import 'reflect-metadata';
import { Action, createExpressServer } from 'routing-controllers';
import { createConnection, getManager } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { UserController } from './controllers/UserController';
import { AuthController } from './controllers/AuthController';
import { InventoryController } from './controllers/InventoryController';
import { GlobalErrorHandler } from './middleware/globalErrorHandler';
import { User } from './entity/User';

createConnection()
  .then(() => {
    const server = createExpressServer({
      currentUserChecker: async (action: Action) => {
        const token = action.request.headers.auth;
        if (!token) return null;
        try {
          const decoded = await jwt.verify(token, process.env.secret);
          return getManager().findOne(User, {
            where: { id: decoded.userId },
            relations: ['profile', 'location', 'containers']
          });
        } catch (error) {
          // throw new HttpError(401, error)
          console.log(error);
        }
      },
      cors: true,
      defaultErrorHandler: false,
      controllers: [UserController, AuthController, InventoryController],
      middlewares: [GlobalErrorHandler]
    });
    server.listen(3000, () => {
      console.log('server started at port 3000');
    });
  }).catch((e) => console.log('connection error: \n', e));
