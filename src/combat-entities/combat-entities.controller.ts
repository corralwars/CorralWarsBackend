import { Controller } from '@nestjs/common';
import { CombatEntitiesService } from './combat-entities.service';

@Controller('combat-entities')
export class CombatEntitiesController {
  constructor(private readonly combatEntitiesService: CombatEntitiesService) {}
}
