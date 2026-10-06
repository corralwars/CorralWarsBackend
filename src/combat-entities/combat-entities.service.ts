import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CombatEntity,
  CombatEntityDocument,
} from './schemas/combatEntity.schema';
import {
  CombatEntityInstance,
  CombatEntityInstanceDocument,
} from './schemas/combatEntityInstance.schema';
import { Model } from 'mongoose';
import { findCombatEntitiesByid } from './dto/findCombatEntiesById.dto';
import { AuthService } from 'src/auth/auth.service';
import { FindCombatEntitiesInstancesByUser } from './dto/findCombatEntitiesInstancesByUser.dto';
import { CreateCombatEntityInstance } from './dto/createCombatEntityInstance.dto';

@Injectable()
export class CombatEntitiesService {
  constructor(
    @InjectModel(CombatEntity.name)
    private readonly combatEntity: Model<CombatEntityDocument>,

    @InjectModel(CombatEntityInstance.name)
    private readonly combatEntityInstance: Model<CombatEntityInstanceDocument>,

    private readonly authService: AuthService,
  ) {}

  async findCombatEntities() {
    return await this.combatEntity.find();
  }

  async findCombatEntitiesByid(body: findCombatEntitiesByid) {
    return await this.combatEntity.findById(body.id);
  }

  async findCombatEntitiesInstancesByUser(
    body: FindCombatEntitiesInstancesByUser,
  ) {
    const payload = await this.authService.getPayload(body.access_token);
    return await this.combatEntityInstance.find({
      userId: payload.sub,
    });
  }

  async createCombatEntityInstance(body: CreateCombatEntityInstance) {
    const payload = await this.authService.getPayload(body.access_token);
    return await this.combatEntityInstance.create({
      userId: payload.sub,
      combatEntityId: body.combatEntityId,
      combatEntityStats: {
        attack: body.combatEntityStats.attack,
        defense: body.combatEntityStats.defense,
        health: body.combatEntityStats.health,
        stamina: body.combatEntityStats.stamina,
        velocity: body.combatEntityStats.velocity,
      },
    });
  }
}
