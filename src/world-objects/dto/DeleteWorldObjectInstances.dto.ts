import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteWorldObjectInstances {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
