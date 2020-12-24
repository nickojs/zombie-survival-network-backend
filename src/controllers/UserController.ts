import {
  Body, Get, HttpError, JsonController, Post, Res
} from 'routing-controllers';
import { validate, ValidationError } from 'class-validator';
import { getRepository } from 'typeorm';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { User } from '../entity/User';

@JsonController('/user')
export class UserController {
  private userRepository = getRepository(User)

  @Get('/')
  async getUsers() {
    return this.userRepository.find();
  }

  @Post('/')
  async createUser(
    @Body() user: Record<string, any>,
    @Res() res: Response
  ) {
    const createUser = this.userRepository.create(user);

    const errors = await validate(createUser);
    if (errors.length > 0) {
      throw new HttpError(422, this.parseErrors(errors));
    }

    const hashedPw = await this.hashPassword(createUser.password);
    createUser.password = hashedPw;
    await this.userRepository.save(createUser);

    return res.status(201).json({ message: 'Created user' });
  }

  private parseErrors(errors: ValidationError[]) {
    const errs = errors.map((e) => (
      Object.keys(e.constraints).map((cons) => e.constraints[cons])
    ));

    return `Validation errors, please verify: ${errs.join(', ')}`;
  }

  private hashPassword = async (pw: string) => bcrypt.hash(pw, 12);
}
