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
import { WindowCalculationsModule } from './window-calculations/window-calculations.module';
import { ReportsModule } from './reports/reports.module';
import { QuotationsModule } from './quotations/quotations.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    OrdersModule, // ✅ Incluye el módulo de pedidos
    WindowsModule,
    WindowTypesModule,
    PvcColorsModule,
    ProfileTypesModule,
    ClientsModule,
    GlassColorsModule,
    WindowCalculationsModule,
    ReportsModule,
    QuotationsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
