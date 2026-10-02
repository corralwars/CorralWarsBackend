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
    const payload = await this.authService.getJwt(token);
    return await this.worldObjectsInstanceDocument.find({
      userId: payload.sub,
    });
  }
}
