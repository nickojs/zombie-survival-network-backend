import {
  Body, CurrentUser, Get, HttpError, JsonController, Param, Post, Put, QueryParam, Res, UseBefore
} from 'routing-controllers';
import { getRepository } from 'typeorm';
import { Response } from 'express';
import * as bodyParser from 'body-parser';
import { Query } from 'typeorm/driver/Query';
import { User } from '../entity/User';
import { UserProfile } from '../entity/Profile';
import { validateUserBody, validateUserProfileBody } from '../middleware/validate';

@JsonController('/user')
export class UserController {
  private userRepository = getRepository(User)

  private userProfileRepository = getRepository(UserProfile);

  @Get('/')
  async getUsers(
    @CurrentUser() userId: string
  ) {
    if (!userId) throw new HttpError(401, 'Needs to be authenticated to do this');
    return this.userRepository.find({
      select: ['id', 'profile'],
      relations: ['profile']
    });
  }

  @Get('/:id')
  async getSingleUser(
    @CurrentUser() userId: string,
    @Param('id') id: string
  ) {
    if (!userId) throw new HttpError(401, 'Needs to be authenticated to do this');
    const user = await this.userRepository.findOne({
      select: ['id', 'username', 'profile'],
      relations: ['profile'],
      where: { id }
    });
    return user;
  }

  @Post('/')
  @UseBefore(bodyParser.json(), validateUserBody)
  async createUser(
    @Body() user: Record<string, any>,
    @Res() res: Response
  ) {
    const createUser = this.userRepository.create(user);
    await this.userRepository.save(createUser);
    return res.status(201).json({ message: 'Created user' });
  }

  @Put('/profile')
  @UseBefore(bodyParser.json(), validateUserProfileBody)
  async editUserProfile(
    @Body() data: Record<string, any>,
    @CurrentUser() userId: string
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile']
    });

    const userProfile = this.userProfileRepository.create({ ...data });

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
}
