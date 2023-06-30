import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.useGlobalInterceptors()
  app.setGlobalPrefix('api');
  await app.listen(9000);
}
bootstrap();
