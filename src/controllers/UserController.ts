import { Get, HttpError, JsonController } from 'routing-controllers';
import { getRepository } from 'typeorm';
import { User } from '../entity/User';

@JsonController('/user')
export class UserControler {
  @Get('/')
  getUsers() {
    const userRepository = getRepository(User);
    return userRepository.find();
  }

  @Get('/error')
  throwError() {
    throw new HttpError(404, 'testing error');
  }
}
