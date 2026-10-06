import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/createUser.dto';
import { createInventory } from '../common/schemas/inventory.schema';
import * as bcrypt from 'bcrypt';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { NotFoundError } from 'rxjs';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findByUsername(username: string) {
    try {
      return await this.userModel.findOne({ username }).exec();
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  async validateUser(id: string) {
    return await this.userModel.findById(id);
  }

  async createUser(body: CreateUserDto) {
    try {
      const hash = await bcrypt.hash(body.password, 10);

      return await this.userModel.create({
        username: body.username,
        password: hash,

        inventory: {
          width: 7,
          height: 5,
          slots: createInventory(7, 5),
        },

        position: {
          x: 0,
          y: 0,
        },

        refresh_token: '',
      });
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  async updateRefresTokenLogin(body: RefreshTokenDto) {
    try {
      const hash = await bcrypt.hash(body.refresh_token, 10);

      return await this.userModel.updateOne(
        { username: body.username },
        {
          refresh_token: hash,
        },
      );
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  async updateRefreshToken(id: string, refresh_token: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundError('usuario no encontrado en la base de datos');
    }

    if (await bcrypt.compare(refresh_token, user.refresh_token)) {
      const hash = await bcrypt.hash(refresh_token, 10);

      return await this.userModel.updateOne(
        {
          _id: user._id,
        },
        {
          refresh_token: hash,
        },
      );
    }

    throw new UnauthorizedException('el refresh_token no coincide');
  }

  async deleteRefreshToken(id: string) {
    const result = await this.userModel.updateOne(
      { _id: id },
      {
        refresh_token: null,
      },
    );
    if (result.matchedCount == 0) {
      throw new UnauthorizedException('la cuenta no tiene una sesión iniciada');
    }
    return result;
  }
}
