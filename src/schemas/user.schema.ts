import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop({ required: true })
  username: string;

  @Prop()
  email: string;

  @Prop({ required: true })
  public_address: string;

  @Prop({ required: true })
  nonce: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ username: 1, public_address: 1 }, { unique: true });
