import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RecipeDocument = HydratedDocument<Recipe>;

@Schema({ _id: false })
export class Input {
  @Prop({ required: true })
  itemId!: string;

  @Prop({ required: true })
  slot!: string;

  @Prop({ required: true })
  quantity!: number;
}
const InputSchema = SchemaFactory.createForClass(Input);

@Schema({ _id: false })
export class Output {
  @Prop({ required: true })
  itemId!: string;

  @Prop({ required: true })
  quantity!: number;
}
const OutputSchema = SchemaFactory.createForClass(Output);

@Schema()
export class Recipe {
  @Prop({ type: [InputSchema], required: true })
  inputs!: Input[];

  @Prop({ type: OutputSchema, required: true })
  outPut!: Output;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
