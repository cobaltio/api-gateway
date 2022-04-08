import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserDTO } from 'src/schemas/user.dto';
import {
  ecrecover,
  toBuffer,
  hashPersonalMessage,
  fromRpcSig,
  publicToAddress,
  bufferToHex,
} from 'ethereumjs-util';

// TODO: Add Login Logic

@Injectable()
export class AuthService {
  constructor(
    @Inject('USERS_SERVICE') private users_microservice: ClientProxy,
  ) {}

  async validateUser(
    public_address: string,
    digital_sign: string,
  ): Promise<UserDTO | null> {
    return new Promise<UserDTO | null>((resolve, reject) => {
      try {
        this.users_microservice
          .send<UserDTO>({ cmd: 'find-user' }, public_address)
          .subscribe((user) => {
            if (user) {
              const msg = `I am signing my one-time nonce: ${user.nonce}`;
              const msgBuffer = Buffer.from(msg);
              const msgHash = hashPersonalMessage(msgBuffer);
              const signatureParams = fromRpcSig(digital_sign);

              const public_key = ecrecover(
                msgHash,
                signatureParams.v,
                signatureParams.r,
                signatureParams.s,
              );
              const addressBuffer = publicToAddress(public_key);
              const address = bufferToHex(addressBuffer);

              if (address.toLowerCase() === public_address.toLowerCase()) {
                this.users_microservice
                  .send({ cmd: 'update-nonce' }, public_address)
                  .subscribe();
                resolve(user);
              } else resolve(null); // if the addresses don't match
            } else resolve(null); // if no user with public_addresses found
          });
      } catch (e) {
        reject(e);
      }
    });
  }
}
