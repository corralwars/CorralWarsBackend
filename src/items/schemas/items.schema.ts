import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Effects, EffectsSchema } from 'src/common/schemas/effect.schema';

export type ItemsDocument = HydratedDocument<Item>;

@Schema()
export class Item {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  type!: string;

  @Prop({ type: [EffectsSchema] })
  effects!: Effects[];
}
export const ItemSchema = SchemaFactory.createForClass(Item);
