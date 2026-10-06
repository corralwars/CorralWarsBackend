import { IsNotEmpty, IsString } from 'class-validator';

export class findCombatEntitiesByid {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
