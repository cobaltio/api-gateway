import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis';

const RedisStore = connectRedis(session);

async function bootstrap() {
  const logger = new Logger('API-GATEWAY');
  const app = await NestFactory.create(AppModule);
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:admin@localhost:5672'],
      queue: 'main_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  //Configure redis client
  const redisClient = redis.createClient({
    host: '127.0.0.1',
    port: 6379,
  });

  redisClient.on('error', function (err) {
    logger.log('Could not establish a connection with redis. ' + err);
  });

  redisClient.on('connect', function (err) {
    logger.log('Connected to redis successfully');
  });

  app.enableCors();
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret:
        'f22392ec143d38eaaf98d5f2c5bdf39a9bb36db052861267476261bb04fbd25ba7ae6a6177fcf8517c6f90d294546246bdea15460612ade2e723372b1c88f611',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      /*  
        In-Order to prevent exploit:
        https://github.com/advisories/GHSA-fj58-h2fr-3pp2 
        in class validator package. 
        This is a Moderate vulnerability that can lead to SQL and 
        Cross-Site Scripting Attacks
      */
      // forbidUnknownValues: true,
    }),
  );
  app.enableCors();
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
