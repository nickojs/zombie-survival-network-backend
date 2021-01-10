import 'reflect-metadata';
import { createExpressServer } from 'routing-controllers';
import { createConnection } from 'typeorm';
import { UserController, currentUserChecker } from './controllers/UserController';
import { AuthController } from './controllers/AuthController';
import { InventoryController } from './controllers/InventoryController';

import { GlobalErrorHandler } from './middleware/globalErrorHandler';

createConnection()
  .then(() => {
    createExpressServer({
      currentUserChecker,
      cors: true,
      defaultErrorHandler: false,
      controllers: [UserController, AuthController, InventoryController],
      middlewares: [GlobalErrorHandler]
    }).listen(3000, () => {
      console.log('server started at port 3000');
    });
  }).catch((e) => console.log('connection error: \n', e));
