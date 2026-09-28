import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Nombre de usuario del jugador',
    example: 'Yair17',
    minLength: 5,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  username!: string;

  @ApiProperty({
    description: 'Contraseña del jugador',
    example: '12345',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  password!: string;
}
