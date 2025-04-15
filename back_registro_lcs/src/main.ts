import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }))
  const configService = app.get(ConfigService);


console.log('🚀 NODE_ENV:', process.env.NODE_ENV);
console.log('📦 DB_HOST:', configService.get<string>('DB_HOST'));
console.log('📦 DB_PORT:', configService.get<number>('DB_PORT'));
console.log('📦 DB_USERNAME:', configService.get<string>('DB_USERNAME'));
console.log('📦 DB_DATABASE:', configService.get<string>('DB_DATABASE'));

const port = configService.get<number>('PORT') || 3000; 


  await app.listen(port);
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);


}
bootstrap();