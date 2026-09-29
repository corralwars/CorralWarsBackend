import { Module } from '@nestjs/common';
import { NeighborsService } from './neighbors.service';
import { NeighborsController } from './neighbors.controller';

@Module({
  controllers: [NeighborsController],
  providers: [NeighborsService],
})
export class NeighborsModule {}
