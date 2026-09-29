import { Controller } from '@nestjs/common';
import { NeighborsService } from './neighbors.service';

@Controller('neighbors')
export class NeighborsController {
  constructor(private readonly neighborsService: NeighborsService) {}
}
