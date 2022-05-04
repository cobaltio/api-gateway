import { Optional } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';

export class CreateListingDto {
  @IsNotEmpty()
  item_id: string;

  @IsNotEmpty()
  price: number;

  @Optional()
  expiresAt: number;

  createdBy: string;
}
