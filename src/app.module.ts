import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { InventoryModule } from './inventory/inventory.module';
import { RecipesModule } from './recipes/recipes.module';
import { WorldObjectsModule } from './world-objects/world-objects.module';
import { ItemsModule } from './items/items.module';
import { NeighborsModule } from './neighbors/neighbors.module';
import { PetsModule } from './pets/pets.module';
import { CombatEntitiesModule } from './combat-entities/combat-entities.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    UserModule,
    AuthModule,
    InventoryModule,
    RecipesModule,
    WorldObjectsModule,
    ItemsModule,
    NeighborsModule,
    PetsModule,
    CombatEntitiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
