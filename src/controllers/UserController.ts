import {
  Body, Get, JsonController, Post, Res
} from 'routing-controllers';
import { validate, ValidationError } from 'class-validator';
import { getRepository } from 'typeorm';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { User } from '../entity/User';

@JsonController('/user')
export class UserControler {
  private userRepository = getRepository(User)

  @Get('/')
  async getUsers() {
    await this.userRepository.find();
  }

  @Post('/')
  async createUser(
    @Body() user: Record<string, any>,
    @Res() res: Response
  ) {
    const createUser = this.userRepository.create(user);

    const errors = await validate(createUser);
    if (errors.length > 0) {
      return res.status(422).json({
        errors: this.parseErrors(errors)
      });
    }

    const hashedPw = await this.hashPassword(createUser.password);
    createUser.password = hashedPw;
    await this.userRepository.save(createUser);

    return res.status(201).json({ message: 'Created user' });
  }

  private parseErrors(errors: ValidationError[]) {
    return errors.map((e) => ({
      property: e.property,
      constraints: e.constraints
    }));
  }

  private hashPassword = async (pw: string) => bcrypt.hash(pw, 12);

  private comparePassword = async (
    passwordToCompare: string,
    existingPassword: string
  ) => bcrypt.compare(passwordToCompare, existingPassword)
}
