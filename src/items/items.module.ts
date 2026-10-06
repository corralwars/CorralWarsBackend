import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Item, ItemSchema } from './schemas/items.schema';

@Module({
  controllers: [ItemsController],
  providers: [ItemsService],
  imports: [
    MongooseModule.forFeature([{ name: Item.name, schema: ItemSchema }]),
  ],
})
export class ItemsModule {}
