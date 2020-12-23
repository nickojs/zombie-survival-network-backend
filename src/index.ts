/* eslint-disable no-console */
import 'reflect-metadata';
import { createExpressServer } from 'routing-controllers';
import { createConnection } from 'typeorm';
import { UserController } from './controllers/UserController';
import { AuthController } from './controllers/AuthController';
import { TypeORMErrorHandler } from './middleware/typeormHandler';
import { GlobalErrorHandler } from './middleware/globalErrorHandler';

createConnection()
  .then(() => {
    const server = createExpressServer({
      cors: true,
      defaultErrorHandler: false,
      controllers: [UserController, AuthController],
      middlewares: [TypeORMErrorHandler, GlobalErrorHandler]
    });
    server.listen(3000, () => {
      console.log('server started at port 3000');
    });
  }).catch((e) => console.log('connection error: \n', e));
