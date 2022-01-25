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
  constructor(@Inject('NFT_SERVICE') private client: ClientProxy) {}

  async validateUser(
    public_addr: string,
    digital_sign: string,
  ): Promise<UserDTO | null> {
    return new Promise<UserDTO | null>((resolve, reject) => {
      try {
        this.client
          .send<UserDTO>({ cmd: 'find-user' }, public_addr)
          .subscribe((user) => {
            if (user) {
              const msg = `I am signing my one-time nonce: ${user.nonce}`;
              const msgBuffer = toBuffer(msg);
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

              if (address.toLowerCase() === public_addr.toLowerCase())
                resolve(user);
              else resolve(null); // if the addresses don't match
            } else resolve(null); // if no user with public_address found
          });
      } catch (e) {
        reject(e);
      }
    });
  }
}
