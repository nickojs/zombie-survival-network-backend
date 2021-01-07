/* eslint-disable consistent-return */
import { NextFunction, Response } from 'express';
import { HttpError } from 'routing-controllers';
import { getRepository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { User } from '../entity/User';
import { UserProfile } from '../entity/Profile';
import { UserLocation } from '../entity/Location';
import { ContainerPosition } from '../entity/ContainerPosition';

const parseErrors = (errors: ValidationError[]) => {
  const errs = errors.map((e) => (
    Object.keys(e.constraints).map((cons) => e.constraints[cons])
  ));

  return `Validation errors, please verify: ${errs.join(', ')}`;
};

export const validateUserBody = async (
  request: Request, response: Response, next: NextFunction
) => {
  const { body } = request;

  const userRepo = getRepository(User);
  const createUser = userRepo.create(body as unknown as User);

  const errors = await validate(createUser);
  if (errors.length > 0) {
    return next(new HttpError(422, parseErrors(errors)));
  }
  next();
};

export const validateUserProfileBody = async (
  request: Request, response: Response, next: NextFunction
) => {
  const { body } = request;

  const userProfileRepo = getRepository(UserProfile);
  const createUserProfile = userProfileRepo.create(body as unknown as User);

  const errors = await validate(createUserProfile);
  if (errors.length > 0) {
    return next(new HttpError(422, parseErrors(errors)));
  }
  next();
};

export const validateUserLocation = async (
  request: Request, response: Response, next: NextFunction
) => {
  const { body } = request;

  const userLocationRepo = getRepository(UserLocation);
  const location = userLocationRepo.create(body as unknown as UserLocation);

  const errors = await validate(location);
  if (errors.length > 0) {
    return next(new HttpError(422, parseErrors(errors)));
  }
  next();
};

export const validateContainerData = async (
  request: Request, response: Response, next: NextFunction
) => {
  const { body } = request;

  const containerRepo = getRepository(ContainerPosition);
  const containerPos = containerRepo.create(body as unknown as UserLocation);

  const errors = await validate(containerPos);
  if (errors.length > 0) {
    return next(new HttpError(422, parseErrors(errors)));
  }
  next();
};
