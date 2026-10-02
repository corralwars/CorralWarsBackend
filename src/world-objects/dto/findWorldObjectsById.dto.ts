import { IsNotEmpty, IsString } from 'class-validator';

export class FindWorldObjectsById {
  @IsNotEmpty()
  @IsString()
  id!: string;
}
