import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Effects, EffectsSchema } from 'src/common/schemas/effect.schema';
import {
  CombatEntityInstanceStats,
  CombatEntityInstanceStatsSchema,
  CombatEntityStats,
  CombatEntityStatsSchema,
} from './stat.schema';

export type CombatEntityDocument = HydratedDocument<CombatEntity>;

@Schema({ _id: false })
export class SpecialAttacks {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: true, type: EffectsSchema })
  effects!: Effects[];

  @Prop({ required: true, type: CombatEntityInstanceStatsSchema })
  specialAttackStats!: CombatEntityInstanceStats;
}
const SpecialAttacksSchema = SchemaFactory.createForClass(SpecialAttacks);

@Schema()
export class CombatEntity {
  @Prop({ unique: true })
  name!: string;

  @Prop({ required: true, type: CombatEntityStatsSchema })
  stats!: CombatEntityStats;

  @Prop({ required: true, type: [SpecialAttacksSchema] })
  specialAttacks!: SpecialAttacks[];
}

export const CombatEntitySchema = SchemaFactory.createForClass(CombatEntity);
