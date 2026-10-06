import { Module } from '@nestjs/common';
import { NeighborsService } from './neighbors.service';
import { NeighborsController } from './neighbors.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Neighboor, NeighboorSchema } from './schemas/neighboor.schema';

@Module({
  controllers: [NeighborsController],
  providers: [NeighborsService],
  imports: [
    MongooseModule.forFeature([
      { name: Neighboor.name, schema: NeighboorSchema },
    ]),
  ],
})
export class NeighborsModule {}
