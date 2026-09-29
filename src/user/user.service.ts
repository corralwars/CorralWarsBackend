import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/createUser.dto';
import { createInventory } from '../inventory/schemas/inventory.schema';
import * as bcrypt from 'bcrypt';
import { RefreshTokenDto } from './dto/refreshToken.dto';

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

  async updateRefresToken(body: RefreshTokenDto) {
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
