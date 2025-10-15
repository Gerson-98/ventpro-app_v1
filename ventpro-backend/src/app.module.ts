import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { OrdersModule } from './orders/orders.module';
import { WindowsModule } from './windows/windows.module';
import { WindowTypesModule } from './window-types/window-types.module';
import { PvcColorsModule } from './pvc-colors/pvc-colors.module';
import { ProfileTypesModule } from './profile-types/profile-types.module';
import { ClientsModule } from './clients/clients.module';
import { GlassColorsModule } from './glass-colors/glass-colors.module';

import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    OrdersModule,       // ✅ Incluye el módulo de pedidos
    WindowsModule,
    WindowTypesModule,
    PvcColorsModule,
    ProfileTypesModule,
    ClientsModule,
    GlassColorsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
