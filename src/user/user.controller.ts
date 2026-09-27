import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('findOne/:username')
  async findOneUser(@Param() username: string) {
    return this.userService.findByUsername(username);
  }
}
