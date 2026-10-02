import { Injectable } from '@nestjs/common';
import {
  WorldObjectsInstance,
  WorldObjectsInstanceDocument,
} from './schemas/worldObjectsInstances.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  WorldObjects,
  WorldObjectsDocument,
} from './schemas/worldObjects.schema';
import { NotFoundError } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { DeleteWorldObjectInstances } from './dto/DeleteWorldObjectInstances.dto';
import { CreateWorldObjectInstance } from './dto/createWorldObjectInstance.dto';
import { createInventory } from 'src/common/schemas/inventory.schema';
import { FindWorldObjectsById } from './dto/findWorldObjectsById.dto';

@Injectable()
export class WorldObjectsService {
  constructor(
    @InjectModel(WorldObjectsInstance.name)
    private readonly worldObjectsInstanceDocument: Model<WorldObjectsInstanceDocument>,

    @InjectModel(WorldObjects.name)
    private readonly worldObjectsDocument: Model<WorldObjectsDocument>,

    private readonly authService: AuthService,
  ) {}

  async userWorldObjectsByUser(token: string) {
    const payload = await this.authService.getPayload(token);
    return await this.worldObjectsInstanceDocument.find({
      userId: payload.sub,
    });
  }

  async getWorldObjects() {
    return await this.worldObjectsDocument.find();
  }

  async getWorldObjectById(body: FindWorldObjectsById) {
    return await this.worldObjectsDocument.findById(body.id);
  }

  async deleteWorldObjectsInstance(body: DeleteWorldObjectInstances) {
    return await this.worldObjectsInstanceDocument.deleteOne({
      _id: body.id,
    });
  }

  async createWorldObjectInstance(body: CreateWorldObjectInstance) {
    const payload = await this.authService.getPayload(body.access_token);
    return await this.worldObjectsInstanceDocument.create({
      userId: payload.sub,
      worldObjectId: body.worldObjectId,
      position: {
        x: body.x,
        y: body.y,
      },
      inventory: {
        width: body.inventoryWidth,
        height: body.inventoryHeigh,
        slots: createInventory(body.inventoryWidth, body.inventoryHeigh),
      },
    });
  }
}
