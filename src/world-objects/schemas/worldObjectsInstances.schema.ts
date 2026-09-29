import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Position, PositionSchema } from 'src/common/schemas/position.schema';
import {
  Inventory,
  InventorySchema,
} from 'src/inventory/schemas/inventory.schema';

export type WorldObjectsInstanceDocument =
  HydratedDocument<WorldObjectsInstance>;

@Schema()
export class WorldObjectsInstance {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  worldObjectId!: string;

  @Prop({ required: true, type: PositionSchema })
  position!: Position;

  @Prop({ required: true, type: InventorySchema })
  inventory!: Inventory;
}
