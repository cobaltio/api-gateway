import {
  Controller,
  Request,
  Get,
  Post,
  UseGuards,
  HttpCode,
  HttpException,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Query,
  Inject,
  Body,
  Param,
} from '@nestjs/common';

import { AuthenticatedGuard } from './common/guards/authenticated.guard';
import { LoginGuard } from './common/guards/login.guard';
import { UserEntity } from './schemas/user.entity';
import { ClientProxy } from '@nestjs/microservices';
import { UserDocument } from './schemas/user.schema';
import { User } from './decorators/user.decorator';
import { CreateNftDto } from './schemas/create-nft.dto';
import { CreateListingDto } from './schemas/create-listing.dto';

type Request = Express.Request & {
  user: UserDocument;
};

@SerializeOptions({
  excludePrefixes: ['_'],
})
@Controller()
export class AppController {
  constructor(
    @Inject('USERS_SERVICE') private users_microservice: ClientProxy,
    @Inject('PAYMENTS_SERVICE') private payments_microservice: ClientProxy,
    @Inject('PRODUCTS_SERVICE') private products_microservice: ClientProxy,
  ) {}

  @HttpCode(200)
  @UseGuards(LoginGuard)
  @Post('auth/login')
  async login(@Request() req, @Body() body) {}

  @UseGuards(AuthenticatedGuard)
  @Post('/auth/logout')
  async logout(@Request() req) {
    console.log('logged out');
    req.logout();
  }

  @Get('auth/getnonce')
  async getNonce(@Query('public_address') public_addr) {
    const noncePromise = new Promise((resolve, reject) => {
      this.users_microservice
        .send<string>({ cmd: 'get-nonce' }, public_addr)
        .subscribe({
          next: (nonce) => {
            resolve({ public_address: public_addr, nonce: nonce });
          },
          error: (err) => {
            reject(
              new HttpException('Malformed Request', HttpStatus.BAD_REQUEST),
            );
          },
        });
    });
    return noncePromise;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthenticatedGuard)
  @Post('/products/create-nft')
  createNFT(@Body() body: CreateNftDto, @User() user: UserDocument) {
    return this.products_microservice.send<any>(
      { cmd: 'create-nft' },
      {
        ...body,
        creator: user.public_address,
      },
    );
  }

  // WIP
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthenticatedGuard)
  @Post('/payments/create-listing')
  createListing(@Body() body: CreateListingDto, @User() user: UserDocument) {
    this.payments_microservice.send({ cmd: 'create-listing' }, body);
  }

  @Get('/products/metadata/:id')
  getProductMetadata(@Param('id') id: string) {}

  @Get('/currentUser')
  @UseGuards(AuthenticatedGuard)
  currentUser(@User() user: UserDocument) {
    return user.public_address;
  }
}
