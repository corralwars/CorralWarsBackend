import { Module } from '@nestjs/common';
import { CombatEntitiesService } from './combat-entities.service';
import { CombatEntitiesController } from './combat-entities.controller';

@Module({
  controllers: [CombatEntitiesController],
  providers: [CombatEntitiesService],
})
export class CombatEntitiesModule {}
