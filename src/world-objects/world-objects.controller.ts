import { Controller } from '@nestjs/common';
import { WorldObjectsService } from './world-objects.service';

@Controller('world-objects')
export class WorldObjectsController {
  constructor(private readonly worldObjectsService: WorldObjectsService) {}
}
