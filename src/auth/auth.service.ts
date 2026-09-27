import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/Login.dto';
import { RegisterDto } from './dto/Register.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(body: LoginDto) {}

  async register(body: RegisterDto) {
    const user = await this.userService.findByUsername(body.username);

    if (user) {
      throw new UnauthorizedException('el usuario ya está en uso');
    }

    if (body.password != body.confirm_password) {
      throw new UnauthorizedException('las contraseñas no coinciden');
    }

    const registerUser = await this.userService.createUser({
      username: body.username,
      password: body.password,
    });

    const access_token = this.jwtService.sign(
      {
        sub: registerUser._id,
        username: registerUser.username,
      },
      {
        expiresIn: '15m',
      },
    );

    const refresh_token = this.jwtService.sign(
      {
        sub: registerUser._id,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
      },
    );

    return { access_token, refresh_token };
  }
}
