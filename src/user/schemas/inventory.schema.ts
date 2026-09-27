import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class InventorySlot {
  @Prop({ default: null })
  itemId!: string | null;

  @Prop({ default: 0, min: 0 })
  quantity!: number;
}
export const InventorySlotSchema = SchemaFactory.createForClass(InventorySlot);

@Schema({ _id: false })
export class Inventory {
  @Prop({ default: 7, required: true })
  width!: number;

  @Prop({ default: 5, required: true })
  height!: number;

  @Prop({ type: [InventorySlotSchema], default: [] })
  slots!: InventorySlot[];
}
export const InventorySchema = SchemaFactory.createForClass(Inventory);

export const createInventory = (width: number, height: number) => {
  return Array.from({ length: width * height }, () => ({
    itemId: null,
    quantity: 0,
  }));
};
