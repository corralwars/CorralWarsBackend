import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NeighborDocument = HydratedDocument<Neighboor>;

@Schema()
export class Neighboor {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  level!: number;

  @Prop({ required: true })
  combatEntityId!: string;

  @Prop({ required: true })
  combatScene!: string;

  @Prop({ required: true, type: Boolean })
  combatEntityAppearsAsPetInNeighborhood!: boolean;
}

export const NeighboorSchema = SchemaFactory.createForClass(Neighboor);
