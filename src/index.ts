import 'reflect-metadata';
import { createConnection } from 'typeorm';
import App from './app';

const server = new App().express;

createConnection()
  .then(() => {
    server.listen(3000, () => {
      console.log('server started at port 3000');
    });
  }).catch((e) => console.log(e));
