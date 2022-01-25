import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NFT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin@admin:localhost:5672'],
          queue: 'nft_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    UsersModule,
    PassportModule,
  ],
  providers: [AuthService, LocalStrategy, SessionSerializer],
})
export class AuthModule {}
