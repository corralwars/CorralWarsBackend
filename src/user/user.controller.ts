import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'buscar un usuario',
    description: 'busca al usuario por su nombre',
  })
  @Get('findOne/:username')
  async findOneUser(@Param() username: string) {
    return this.userService.findByUsername(username);
  }
}
