import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateCombatEntityInstance {
  @IsString()
  @IsNotEmpty()
  access_token!: string;

  @IsString()
  @IsNotEmpty()
  combatEntityId!: string;

  @ValidateNested()
  @Type(() => CreateCombatEntityInstance)
  combatEntityStats!: CreateCombatEntityInstanceStats;
}

class CreateCombatEntityInstanceStats {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  health!: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  attack!: number;

  @Min(0)
  @IsNumber()
  @IsNotEmpty()
  defense!: number;

  @Min(0)
  @IsNumber()
  @IsNotEmpty()
  velocity!: number;

  @Min(0)
  @IsNumber()
  @IsNotEmpty()
  stamina!: number;
}
