import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CombatEntityStats, CombatEntityStatsSchema } from './stat.schema';

export type CombatEntityInstanceDocument = HydratedDocument<CombatEntity>;

@Schema({ timestamps: true })
export class CombatEntity {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  combatEntityId!: string;

  @Prop({ required: true, type: CombatEntityStatsSchema })
  combatEntityStats!: CombatEntityStats;
}
export const CombatEntitySchema = SchemaFactory.createForClass(CombatEntity);
