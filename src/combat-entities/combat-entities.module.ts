import { Module } from '@nestjs/common';
import { CombatEntitiesService } from './combat-entities.service';
import { CombatEntitiesController } from './combat-entities.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CombatEntity,
  CombatEntitySchema,
} from './schemas/combatEntity.schema';
import {
  CombatEntityInstance,
  CombatEntityInstanceSchema,
} from './schemas/combatEntityInstance.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [CombatEntitiesController],
  providers: [CombatEntitiesService],
  imports: [
    MongooseModule.forFeature([
      { name: CombatEntity.name, schema: CombatEntitySchema },
      { name: CombatEntityInstance.name, schema: CombatEntityInstanceSchema },
    ]),
    AuthModule,
  ],
})
export class CombatEntitiesModule {}
