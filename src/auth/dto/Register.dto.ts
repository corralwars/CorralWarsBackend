import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'nombre del jugador',
    example: 'Yair17',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  username!: string;

  @ApiProperty({
    description: 'contraseña del jugador',
    example: '12345',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  password!: string;

  @ApiProperty({
    description: 'confirmación de la contraseña del jugador',
    example: '12345',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  confirm_password!: string;
}
