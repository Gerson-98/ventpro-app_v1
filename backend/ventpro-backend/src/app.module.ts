import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// ✅ Importar tus módulos
import { OrdersModule } from './orders/orders.module';
import { WindowsModule } from './windows/windows.module';
import { PvcColorsModule } from './pvc-colors/pvc-colors.module';
import { ProfileTypesModule } from './profile-types/profile-types.module';
import { WindowTypesModule } from './window-types/window-types.module';
import { ClientsModule } from './clients/clients.module';

// ✅ Importar el servicio de Prisma
import { PrismaService } from './prisma/prisma.service';
import { GlassColorsModule } from './glass-colors/glass-colors.module';

@Module({
  imports: [
    // 👇 Ya no usamos TypeOrmModule
    OrdersModule,
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
