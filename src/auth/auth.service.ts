import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/Login.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async Login(body: LoginDto) {
    console.log(body);
  }
}
