import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ItemsDocument = HydratedDocument<Item>;

@Schema({ _id: false })
export class Effects {
  @Prop()
  stat!: string;

  @Prop()
  operation!: string;

  @Prop()
  value!: number;
}
const EffectsSchema = SchemaFactory.createForClass(Effects);

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
