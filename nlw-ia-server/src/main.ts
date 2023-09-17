import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ativar CORS
  app.enableCors({
    origin: '*',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove os dados adicionais enviados no payload
      forbidNonWhitelisted: true, // lança um erro quando algum dado adicional é enviado
      transform: true, // transforma o objeto para a instância do DTO
    }),
  );

  await app.listen(3333);
}
bootstrap();
