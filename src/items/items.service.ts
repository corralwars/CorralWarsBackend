import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Item, ItemsDocument } from './schemas/items.schema';
import { Model } from 'mongoose';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name)
    private readonly itemModel: Model<ItemsDocument>,
  ) {}

  async findItems() {
    return await this.itemModel.find();
  }

  async findItemsById(id: string) {
    return await this.itemModel.findById(id);
  }
}
