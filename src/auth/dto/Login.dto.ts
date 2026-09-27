import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  username!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  password!: string;
}
