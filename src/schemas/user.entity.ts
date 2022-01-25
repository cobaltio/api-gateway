import { Exclude } from 'class-transformer';

export class UserEntity {
  name: string;
  username: string;
  email: string;

  @Exclude()
  nonce: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
