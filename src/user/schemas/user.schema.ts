import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Inventory, InventorySchema } from './inventory.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
export class Position {
  @Prop({ required: true, default: 0 })
  x!: number;

  @Prop({ required: true, default: 0 })
  y!: number;
}
const PositionSchema = SchemaFactory.createForClass(Position);

@Schema()
export class User {
  @Prop({ required: true, unique: true, minLength: 5 })
  username!: string;

  @Prop({ required: true })
  password!: string;

  @Prop()
  refresh_token!: string;

  @Prop({ type: PositionSchema, required: true })
  position!: Position;

  @Prop({ type: InventorySchema, required: true })
  inventory!: Inventory;

  @Prop({ required: true, default: 1 })
  level!: number;

  @Prop({ required: true, default: 0 })
  experience!: number;

  @Prop({ type: [String], default: [] })
  defatedNeighbors!: string[];
}
export const UserSchema = SchemaFactory.createForClass(User);
