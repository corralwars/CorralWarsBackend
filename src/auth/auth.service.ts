import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/Login.dto';
import { RegisterDto } from './dto/Register.dto';
import { UserService } from 'src/user/user.service';
import { compare } from 'bcrypt';
import { LogoutDto } from './dto/Logout.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(body: LoginDto) {
    const data = await this.userService.findByUsername(body.username);
    if (!data) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    const passwordCorrect = await compare(body.password, data.password);
    if (!passwordCorrect) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    const access_token = this.jwtService.sign(
      { sub: data._id.toString(), username: data.username },
      { expiresIn: '15m' },
    );
    const refresh_token = this.jwtService.sign(
      { sub: data._id.toString() },
      { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET },
    );
    await this.userService.updateRefresTokenLogin({
      username: data.username,
      refresh_token,
    });
    return { access_token, refresh_token };
  }

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
      { sub: registerUser._id.toString(), username: registerUser.username },
      { expiresIn: '15m' },
    );
    const refresh_token = this.jwtService.sign(
      { sub: registerUser._id.toString() },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
    );
    await this.userService.updateRefresTokenLogin({
      username: body.username,
      refresh_token,
    });
    return { access_token, refresh_token };
  }

  async logout(body: LogoutDto) {
    try {
      const payload = this.jwtService.verify(body.refresh_token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      return await this.userService.deleteRefreshToken(payload.sub);
    } catch {
      throw new UnauthorizedException('Token invalido o expirado');
    }
  }

  async getPayload(jwt: string) {
    const payload = this.jwtService.verify(jwt);
    if (!payload) {
      throw new UnauthorizedException('token no existente');
    }
    return payload;
  }

  async refreshToken(token: string) {
    const payload = this.jwtService.verify(token);
    return this.userService.updateRefreshToken(payload.sub, token);
  }
}
