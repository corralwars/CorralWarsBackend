import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutDto {
  @ApiProperty({
    description: 'Refresh Token del usuario',
    example: 'lo que sea',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token!: string;
}
