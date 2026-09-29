import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class CombatEntityStats {
  @Prop({ required: true, min: 1000 })
  health!: number;

  @Prop({ required: true, min: 10 })
  attack!: number;

  @Prop({ required: true, min: 0 })
  defense!: number;

  @Prop({ required: true, min: 300 })
  velocity!: number;

  @Prop({ required: true, min: 30 })
  stamina!: number;

  @Prop({ required: true, type: Float32Array, min: 0.2 })
  specialChance!: number;
}
export const CombatEntityStatsSchema =
  SchemaFactory.createForClass(CombatEntityStats);

@Schema({ _id: false })
export class SpecialAttackStats {
  @Prop({ required: true, min: 300 })
  velocityMultiply!: number;

  @Prop({ required: true, min: 10 })
  attackMultiply!: number;
}
export const SpecialAttacksStatsSchema =
  SchemaFactory.createForClass(SpecialAttackStats);

export class CombatEntityInstanceStats {
  @Prop({ required: true, min: 0 })
  health!: number;

  @Prop({ required: true, min: 0 })
  attack!: number;

  @Prop({ required: true, min: 0 })
  defense!: number;

  @Prop({ required: true, min: 0 })
  velocity!: number;

  @Prop({ required: true, min: 0 })
  stamina!: number;
}
export const CombatEntityInstanceStatsSchema = SchemaFactory.createForClass(
  CombatEntityInstanceStats,
);
