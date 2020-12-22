/* eslint-disable no-console */
import 'reflect-metadata';
import { createExpressServer } from 'routing-controllers';
import { createConnection } from 'typeorm';
import { UserControler } from './controllers/UserController';
import { CustomErrorHandler } from './middleware/errorHandler';

createConnection()
  .then(() => {
    const server = createExpressServer({
      cors: true,
      defaultErrorHandler: false,
      controllers: [UserControler],
      middlewares: [CustomErrorHandler]
    });
    server.listen(3000, () => {
      console.log('server started at port 3000');
    });
  }).catch((e) => console.log('connection error: \n', e));
