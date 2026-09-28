import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'buscar un usuario',
    description: 'busca al usuario por su nombre',
  })
  @ApiParam({
    name: 'username',
    description: 'nombre del usuario que se desea buscar',
    example: 'Yair17',
  })
  @Get('findOne/:username')
  async findOneUser(@Param('username') username: string) {
    return this.userService.findByUsername(username);
  }
}
