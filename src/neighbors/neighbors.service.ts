import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Neighboor, NeighborDocument } from './schemas/neighboor.schema';
import { Model } from 'mongoose';

@Injectable()
export class NeighborsService {
  constructor(
    @InjectModel(Neighboor.name)
    private readonly neighboorModel: Model<NeighborDocument>,
  ) {}
}
