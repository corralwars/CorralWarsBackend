import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  CombatEntityInstanceStats,
  CombatEntityInstanceStatsSchema,
} from './stat.schema';

export type CombatEntityInstanceDocument =
  HydratedDocument<CombatEntityInstance>;

@Schema({ timestamps: true })
export class CombatEntityInstance {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  combatEntityId!: string;

  @Prop({ required: true, type: CombatEntityInstanceStatsSchema })
  combatEntityStats!: CombatEntityInstanceStats;

  @Prop({ required: true, default: 0, min: 0 })
  statPoints!: number;

  @Prop({ required: true, default: 0, min: 0 })
  experience!: number;

  @Prop({ required: true, default: 1, min: 1 })
  level!: number;
}
export const CombatEntityInstanceSchema =
  SchemaFactory.createForClass(CombatEntityInstance);
