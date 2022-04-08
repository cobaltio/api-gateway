class Metadata {
  name: string;
  image: string;
  external_url?: string;
  animation_url?: string;
  description?: string;
  attributes?: Object;
}

export class CreateNftDto {
  metadata: Metadata;
}
