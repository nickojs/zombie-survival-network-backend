import {
  Body, CurrentUser, Get, JsonController, Param, Post, Put, UseBefore
} from 'routing-controllers';
import { getRepository, Not } from 'typeorm';
import * as bodyParser from 'body-parser';
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
    @CurrentUser({ required: true }) user: User
  ) {
    return this.userRepository.find({
      select: ['id', 'profile'],
      relations: ['profile'],
      where: { id: Not(user.id) }
    });
  }

  @Get('/:id')
  async getSingleUser(
    @CurrentUser({ required: true }) user: User,
    @Param('id') id: string
  ) {
    const fetchUser = await this.userRepository.findOne({
      select: ['id', 'username', 'email', 'profile'],
      relations: ['profile'],
      where: { id }
    });
    return fetchUser;
  }

  @Post('/self') // for some unknown reason, this does not work as a Get request (on insomnia at least)
  async getCurrentUser(
    @CurrentUser({ required: true }) user: User
  ) {
    const currentUser = await this.userRepository.findOne({
      relations: ['profile', 'location'],
      where: { id: user.id }
    });
    const { password, ...rest } = currentUser;

    return rest;
  }

  @Post('/')
  @UseBefore(bodyParser.json(), validateUserBody)
  async createUser(@Body() user: Record<string, any>) {
    const createUser = this.userRepository.create(user);
    await this.userRepository.save(createUser);
    return { message: 'Created user' };
  }

  @Put('/profile')
  @UseBefore(bodyParser.json(), validateUserProfileBody)
  async editUserProfile(
    @Body() data: Record<string, any>,
    @CurrentUser({ required: true }) user: User
  ) {
    const userProfile = this.userProfileRepository.create(data);
    const { profile } = user || { };

    const updatedProfile = { ...profile, ...userProfile };
    await this.userProfileRepository.save(updatedProfile);

    user.profile = updatedProfile;
    await this.userRepository.save(user);

    return {
      message: 'Updated profile',
      profile: updatedProfile
    };
  }

  @Put('/location')
  @UseBefore(bodyParser.json(), validateUserLocation)
  async updateUserLocation(
    @Body() data: Record<string, any>,
    @CurrentUser({ required: true }) user: User
  ) {
    const userLocation = this.userLocationRepository.create(data);
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
