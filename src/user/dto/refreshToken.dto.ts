import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  username!: string;

  @IsString()
  @IsNotEmpty()
  refresh_token!: string;
}
