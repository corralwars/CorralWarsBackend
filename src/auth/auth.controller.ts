import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/Login.dto';
import { RegisterDto } from './dto/Register.dto';
import { LogoutDto } from './dto/Logout.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/RefreshToken';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @ApiOperation({
    summary: 'Iniciar Sesión',
    description: 'Inicia sesión en CorralWars',
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión hecho',
    schema: {
      example: { access_token: 'lo que sea', refresh_token: 'lo que sea' },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'el usuario o la contraseña no son correctos',
  })
  async login(@Body() body: LoginDto) {
    return await this.authService.login(body);
  }
  @Post('register')
  @ApiOperation({
    summary: 'Registrar cuenta',
    description: 'registrar cuenta nueva en CorralWars',
  })
  @ApiResponse({
    status: 200,
    description: 'registro correcto',
    example: { access_token: 'lo que sea', refresh_token: 'lo que sea' },
  })
  @ApiResponse({
    status: 401,
    description: 'usuario ya existente o las contraseñas no coinciden',
  })
  async register(@Body() body: RegisterDto) {
    return await this.authService.register(body);
  }
  @ApiOperation({
    summary: 'Cerrar Sesión',
    description: 'Cerrar sesión en CorralWars',
  })
  @ApiResponse({ status: 200, description: 'sesión cerrada' })
  @ApiResponse({
    status: 401,
    description:
      'el usuario no tiene una sesión iniciada, esta excepción no es normal',
  })
  @Post('Logout')
  async logout(@Body() body: LogoutDto) {
    return await this.authService.logout(body);
  }
  @Post('refreshToken') async refresToken(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.token);
  }
}
