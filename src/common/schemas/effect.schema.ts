import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Effects {
  @Prop()
  stat!: string;

  @Prop()
  operation!: string;

  @Prop()
  value!: number;
}
export const EffectsSchema = SchemaFactory.createForClass(Effects);
