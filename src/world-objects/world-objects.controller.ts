import { Controller, Get, Param } from '@nestjs/common';
import { WorldObjectsService } from './world-objects.service';

@Controller('world-objects')
export class WorldObjectsController {
  constructor(private readonly worldObjectsService: WorldObjectsService) {}

  @Get('worldObjectInstanceByUser/:token')
  async worldObjectInstaceByUser(@Param('token') token: string) {
    return await this.worldObjectsService.userWorldObjectsByUser(token);
  }
}
