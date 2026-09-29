import { Module } from '@nestjs/common';
import { WorldObjectsService } from './world-objects.service';
import { WorldObjectsController } from './world-objects.controller';

@Module({
  controllers: [WorldObjectsController],
  providers: [WorldObjectsService],
})
export class WorldObjectsModule {}
