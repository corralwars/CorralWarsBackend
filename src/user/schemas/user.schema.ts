import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';
import {
  Inventory,
  InventorySchema,
} from '../../inventory/schemas/inventory.schema';
import { Position, PositionSchema } from 'src/common/schemas/position.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, minLength: 5 })
  username!: string;

  @Prop({ required: true })
  password!: string;

  @Prop()
  refresh_token!: string;

  @Prop({ required: true, default: 0, min: 0 })
  coins!: number;

  @Prop({ type: PositionSchema, required: true })
  position!: Position;

  @Prop({ type: InventorySchema, required: true })
  inventory!: Inventory;

  @Prop({ type: [String], default: [] })
  defatedNeighbors!: string[];

  @Prop()
  activatedPetId!: string;

  @Prop({ required: true, default: 'defaultSkin' })
  activatedSkin!: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
