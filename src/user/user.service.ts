import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/createUser.dto';
import { createInventory } from './schemas/inventory.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
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
      const saltRounds = 10;
      const password = body.password;
      const hash = await bcrypt.hash(password, saltRounds);

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
      });
    } catch (error) {
      throw new Error(`error: ${error}`);
    }
  }
}
