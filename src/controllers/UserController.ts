import {
  Body, Get, JsonController, Post
} from 'routing-controllers';
import { getRepository } from 'typeorm';
import { User } from '../entity/User';

@JsonController('/user')
export class UserControler {
  private userRepository = getRepository(User)

  @Get('/')
  async getUsers() {
    await this.userRepository.find();
  }

  @Post('/')
  async createUser(@Body() user: User) {
    await this.userRepository.save(user);
  }
}
