import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { WorldObjectsService } from './world-objects.service';
import { DeleteWorldObjectInstances } from './dto/DeleteWorldObjectInstances.dto';
import { CreateWorldObjectInstance } from './dto/createWorldObjectInstance.dto';

@Controller('world-objects')
export class WorldObjectsController {
  constructor(private readonly worldObjectsService: WorldObjectsService) {}

  @Get('worldObjectInstanceByUser/:token')
  async worldObjectInstaceByUser(@Param('token') token: string) {
    return await this.worldObjectsService.userWorldObjectsByUser(token);
  }

  @Get('worldObjects')
  async getWorldObjects() {
    return await this.worldObjectsService.getWorldObjects();
  }

  @Post('createWorldObjectInstance')
  async createWorldObjectInstance(@Body() body: CreateWorldObjectInstance) {
    return await this.createWorldObjectInstance(body);
  }

  @Put('deleteWorldObjectInstance')
  async deleteWorldObjectInstance(@Body() body: DeleteWorldObjectInstances) {
    return await this.worldObjectsService.deleteWorldObjectsInstance(body);
  }
}
