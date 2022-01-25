import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from '../schemas/create-user.dto';
import { User, UserDocument } from '../schemas/user.schema';
import * as crypto from 'crypto';

/*
  TODO:
    - Unit Tests
*/

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(createUserDto: CreateUserDto) {
    const { username, email } = createUserDto;

    const user = await this.userModel.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (!user) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto
        .pbkdf2Sync(createUserDto.password, salt, 2048, 32, 'sha512')
        .toString('hex');
      createUserDto.password = [salt, hash].join('$');

      const createdUser = new this.userModel(createUserDto);
      createdUser.save();
      return true;
    }
    return false;
  }

  async findOne(username: string): Promise<User> {
    return this.userModel.findOne({ username: username });
  }
}
