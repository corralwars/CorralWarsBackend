import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Position, PositionSchema } from 'src/common/schemas/position.schema';
import { Recipe, RecipeSchema } from 'src/recipes/schemas/recipe.schema';

export type WorldObjectsDocument = HydratedDocument<WorldObjects>;

@Schema()
export class WorldObjects {
  @Prop()
  itemId!: string;

  @Prop({ required: true })
  @Prop({ type: PositionSchema, required: true })
  position!: Position;

  @Prop({ required: true })
  movible!: boolean;

  @Prop({ type: [RecipeSchema], required: true })
  recipes!: Recipe[];
}
