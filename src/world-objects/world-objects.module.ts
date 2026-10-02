import { Module } from '@nestjs/common';
import { WorldObjectsService } from './world-objects.service';
import { WorldObjectsController } from './world-objects.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WorldObjectsInstance,
  WorldObjectsInstanceSchema,
} from './schemas/worldObjectsInstances.schema';
import {
  WorldObjects,
  WorldObjectsSchema,
} from './schemas/worldObjects.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [WorldObjectsController],
  providers: [WorldObjectsService],
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: WorldObjectsInstance.name,
        schema: WorldObjectsInstanceSchema,
      },
      {
        name: WorldObjects.name,
        schema: WorldObjectsSchema,
      },
    ]),
  ],
})
export class WorldObjectsModule {}
