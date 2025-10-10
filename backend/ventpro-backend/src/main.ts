// backend/ventpro-backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as path from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS opcional (misma origin en Railway, pero no estorba)
  app.enableCors();

  const expressApp = app.getHttpAdapter().getInstance();

  // Ruta del frontend compilado (en monorepo)
  // __dirname en producción apunta a backend/ventpro-backend/dist
  const frontendPath =
    process.env.FRONTEND_DIST_DIR ||
    path.join(__dirname, '..', '..', '..', 'ventpro-frontend', 'dist');

  // Servir archivos estáticos
  expressApp.use(express.static(frontendPath));

  // Fallback SPA: si NO es una ruta de API, devolvemos index.html
  const apiPrefixes = [
    '/api',
    '/clients',
    '/orders',
    '/windows',
    '/window-types',
    '/profile-types',
    '/glass-colors',
    '/pvc-colors',
  ];
  expressApp.use((req, res, next) => {
    if (apiPrefixes.some((p) => req.path.startsWith(p))) {
      return next();
    }
    return res.sendFile(path.resolve(frontendPath, 'index.html'));
  });

  const PORT = Number(process.env.PORT) || 8080;
  await app.listen(PORT, '0.0.0.0');
  console.log(`✅ Backend + Frontend listos en http://localhost:${PORT}`);
}

bootstrap();
