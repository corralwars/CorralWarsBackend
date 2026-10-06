import { IsNotEmpty, IsString } from 'class-validator';

export class FindCombatEntitiesInstancesByUser {
  @IsNotEmpty()
  @IsString()
  access_token!: string;
}
