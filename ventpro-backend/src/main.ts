import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS correcto (ajusta el dominio del front si cambias de hosting)
  app.enableCors({
    origin: [
      'https://ventpro-frontend-production.up.railway.app',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  const port = Number(process.env.PORT) || 8080;
  await app.listen(port, '0.0.0.0');
  console.log(`✅ Backend listo en el puerto ${port}`);
}
bootstrap();
