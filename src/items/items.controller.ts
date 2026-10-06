import { Controller, Get, Param } from '@nestjs/common';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('')
  async getItems() {
    return await this.itemsService.findItems();
  }

  @Get('/:id')
  async getItemsById(@Param('id') id: string) {
    return await this.itemsService.findItemsById(id);
  }
}
