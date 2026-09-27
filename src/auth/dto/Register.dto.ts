import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  username!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  password!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  confirm_password!: string;
}
