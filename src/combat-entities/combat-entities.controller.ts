import { Body, Controller, Get } from '@nestjs/common';
import { CombatEntitiesService } from './combat-entities.service';
import { FindCombatEntitiesInstancesByUser } from './dto/findCombatEntitiesInstancesByUser.dto';

@Controller('combat-entities')
export class CombatEntitiesController {
  constructor(private readonly combatEntitiesService: CombatEntitiesService) {}

  @Get('get-combat-entities')
  async findCombatEntities() {
    return await this.combatEntitiesService.findCombatEntities();
  }

  @Get('find-combat-entity-instances-by-user-id')
  async findCombatEntitiesInstancesByUser(
    @Body() body: FindCombatEntitiesInstancesByUser,
  ) {
    return await this.combatEntitiesService.findCombatEntitiesInstancesByUser(
      body,
    );
  }
}
