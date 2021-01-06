import {
  Body, HttpError, JsonController, Post
} from 'routing-controllers';
import { getRepository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '../entity/User';

interface SignInProps {
  identifier: string;
  password: string;
}

@JsonController('/auth')
export class AuthController {
  private userRepository = getRepository(User)

  @Post('/signin')
  async signIn(@Body() data: SignInProps) {
    const { identifier, password } = data;

    const findUser = await this.userRepository.findOne({
      where: [
        { email: identifier },
        { username: identifier }
      ],
      relations: ['profile', 'location']
    });

    if (!findUser || findUser === undefined) throw new HttpError(404, 'Could not find user');
    const checkPw = await this.comparePassword(password, findUser.password);

    if (!checkPw) throw new HttpError(401, 'Invalid credentials');

    return { token: this.generateJwt(findUser) };
  }

  private comparePassword = async (
    passwordToCompare: string,
    existingPassword: string
  ) => bcrypt.compare(passwordToCompare, existingPassword)

  private generateJwt = (user: User) => jwt.sign({ userId: user.id }, process.env.secret, { expiresIn: '1h' })
}
