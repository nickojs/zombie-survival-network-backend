import * as express from 'express';
import * as helmet from 'helmet';
import * as cors from 'cors';

import routes from './routes';
import errorMiddleware from './middleware/errorHandler';

class App {
  public express;

  constructor() {
    // express instance
    this.express = express();

    // midlewares
    this.express.use(cors());
    this.express.use(helmet());

    // routes
    this.express.use('/', routes, errorMiddleware);
  }
}

export default App;
