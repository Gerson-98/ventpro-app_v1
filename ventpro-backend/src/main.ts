// RUTA: ventpro-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Lista de orígenes permitidos (la "lista VIP")
  const whitelist = [
    'http://localhost:5173', // Tu frontend de desarrollo local
    'https://creative-essence-production.up.railway.app', // Tu frontend de producción
  ];

  app.enableCors({
    origin: function (origin, callback) {
      // Permitimos la conexión si el origen está en nuestra lista
      // o si la petición no tiene origen (ej. Postman)
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // Si no está en la lista, lo rechazamos
        callback(new Error('No permitido por la política de CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Escucha en el puerto definido por Railway o en el 3000 por defecto
  await app.listen(process.env.PORT || 3000);
  console.log(`✅ Backend listo en el puerto ${await app.getUrl()}`);
}
bootstrap();
