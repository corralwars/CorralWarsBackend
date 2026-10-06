import { Controller, Get, Param } from '@nestjs/common';
import { NeighborsService } from './neighbors.service';

@Controller('neighbors')
export class NeighborsController {
  constructor(private readonly neighborsService: NeighborsService) {}

  @Get('')
  async getNeighboors() {
    return await this.neighborsService.findNeighboors();
  }

  @Get('/:id')
  async getNeighboorById(@Param('id') id: string) {
    return await this.neighborsService.findNeighboorById(id);
  }
}
