import {
  Body, CurrentUser, Get, HttpError, JsonController, Param, Post, Put, QueryParam, Res, UseBefore
} from 'routing-controllers';
import { getRepository } from 'typeorm';
import { Response } from 'express';
import * as bodyParser from 'body-parser';
import { Query } from 'typeorm/driver/Query';
import { User } from '../entity/User';
import { UserProfile } from '../entity/Profile';
import { validateUserBody, validateUserLocation, validateUserProfileBody } from '../middleware/validate';
import { UserLocation } from '../entity/Location';

@JsonController('/user')
export class UserController {
  private userRepository = getRepository(User)

  private userProfileRepository = getRepository(UserProfile);

  private userLocationRepository = getRepository(UserLocation);

  @Get('/')
  async getUsers(
    @CurrentUser() user: User
  ) {
    if (!user) throw new HttpError(401, 'Needs to be authenticated to do this');
    return this.userRepository.find({
      select: ['id', 'profile'],
      relations: ['profile']
    });
  }

  @Get('/:id')
  async getSingleUser(
    @CurrentUser() user: User,
    @Param('id') id: string
  ) {
    if (!user) throw new HttpError(401, 'Needs to be authenticated to do this');
    const fetchUser = await this.userRepository.findOne({
      select: ['id', 'username', 'profile'],
      relations: ['profile'],
      where: { id }
    });
    return fetchUser;
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
    @CurrentUser() user: User
  ) {
    const userToEdit = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['profile']
    });

    const userProfile = this.userProfileRepository.create({ ...data });

    const { profile } = userToEdit || { };
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
    userToEdit.profile = userProfile;
    await this.userRepository.save(userToEdit);

    return {
      message: 'Created profile for this user',
      profile: userProfile
    };
  }

  @Put('/location')
  @UseBefore(bodyParser.json(), validateUserLocation)
  async updateUserLocation(
    @Body() body: Record<string, any>,
    @CurrentUser() user: User
  ) {
    const userLocation = this.userLocationRepository.create(body);
    const { location } = user || { };

    const updatedLocation = { ...location, ...userLocation };
    await this.userLocationRepository.save(updatedLocation);

    user.location = updatedLocation;
    await this.userRepository.save(user);

    return {
      message: 'Updated location',
      location: updatedLocation
    };
  }
}
