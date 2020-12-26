import {
  Body, CurrentUser, Get, HttpError, JsonController, Post, Put, Res
} from 'routing-controllers';
import { validate, ValidationError } from 'class-validator';
import { getRepository } from 'typeorm';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { User } from '../entity/User';
import { UserProfile } from '../entity/Profile';

@JsonController('/user')
export class UserController {
  private userRepository = getRepository(User)

  private userProfileRepository = getRepository(UserProfile);

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

  @Put('/profile')
  async editUserProfile(
    @Body() data: Record<string, any>,
    @CurrentUser() userId: string
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile']
    });

    const userProfile = this.userProfileRepository.create({
      ...data
    });

    const errors = await validate(userProfile);
    if (errors.length > 0) {
      throw new HttpError(422, this.parseErrors(errors));
    }

    const { profile } = user || { };
    // updates existing profile
    if (profile) {
      const updatedProfile = { ...profile, ...userProfile };
      await this.userProfileRepository.save(updatedProfile);
      return {
        message: 'Updated profile',
        profile: updatedProfile
      };
    }

    await this.userProfileRepository.save(userProfile);
    user.profile = userProfile;
    await this.userRepository.save(user);

    return {
      message: 'Created profile for this user',
      profile: userProfile
    };
  }

  private parseErrors(errors: ValidationError[]) {
    const errs = errors.map((e) => (
      Object.keys(e.constraints).map((cons) => e.constraints[cons])
    ));

    return `Validation errors, please verify: ${errs.join(', ')}`;
  }

  private hashPassword = async (pw: string) => bcrypt.hash(pw, 12);
}
