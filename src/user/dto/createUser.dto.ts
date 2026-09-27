import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(5)
  @IsNotEmpty()
  username!: string;

  @IsString()
  @MinLength(10)
  @IsNotEmpty()
  password!: string;
}
