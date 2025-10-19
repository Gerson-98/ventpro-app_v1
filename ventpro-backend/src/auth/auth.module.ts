// RUTA: src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // ✨ 1. Importa el módulo de Usuarios
import { PassportModule } from '@nestjs/passport'; // ✨ 2. Importa el módulo de Passport
import { JwtModule } from '@nestjs/jwt'; // ✨ 3. Importa el módulo de JWT

@Module({
  // ✨ 4. Configura los módulos importados
  imports: [
    UsersModule, // Para que AuthService pueda usar UsersService
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Usa la llave secreta de tu archivo .env
      signOptions: { expiresIn: '1d' }, // El token de login durará 1 día
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
