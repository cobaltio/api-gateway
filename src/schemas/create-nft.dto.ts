import { IsNotEmpty } from 'class-validator';

class Metadata {
  name: string;
  image?: string;
  external_url?: string;
  animation_url?: string;
  description?: string;
  attributes?: Object;
}

export class CreateNftDto {
  @IsNotEmpty()
  metadata: Metadata;
}
