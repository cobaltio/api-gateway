import {
  Controller,
  Request,
  Get,
  Post,
  UseGuards,
  Body,
  HttpCode,
  HttpException,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Query,
  Inject,
  Res,
} from '@nestjs/common';

import { AppService } from './app.service';
import { CreateUserDto } from './schemas/create-user.dto';
import { UsersService } from './users/users.service';
import { AuthenticatedGuard } from './common/guards/authenticated.guard';
import { LoginGuard } from './common/guards/login.guard';
import { UserEntity } from './schemas/user.entity';
import { ClientProxy } from '@nestjs/microservices';
import { Response } from 'express';

@SerializeOptions({
  excludePrefixes: ['_'],
})
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private usersService: UsersService,
    @Inject('NFT_SERVICE') private client: ClientProxy,
  ) {}

  @HttpCode(200)
  @UseGuards(LoginGuard)
  @Post('auth/login')
  async login(@Request() req) {}

  @UseGuards(AuthenticatedGuard)
  @Post('/auth/logout')
  async logout(@Request() req) {
    req.logout();
  }

  @Get('auth/getnonce')
  async getNonce(@Query('public_address') public_addr) {
    const noncePromise = new Promise((resolve, reject) => {
      this.client.send<string>({ cmd: 'get-nonce' }, public_addr).subscribe(
        (nonce) => {
          resolve({ public_address: public_addr, nonce: nonce });
        },
        (err) => {
          reject(
            new HttpException('Malformed Request', HttpStatus.BAD_REQUEST),
          );
        },
      );
    });
    return noncePromise;
  }

  @Post('auth/register')
  async register(@Body() user: CreateUserDto) {
    const is_created = await this.usersService.createUser(user);
    if (!is_created) {
      throw new HttpException(
        'User with email/username already exists',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthenticatedGuard)
  @Get('/home')
  getHome(@Request() req): UserEntity {
    return new UserEntity(req.user);
  }

  @Get('/')
  getHello() {
    return 'Hello World!';
  }
}
