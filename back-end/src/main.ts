import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';
import { seedRootUser } from './utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 增加 root 用户
  const dataSource = app.get(DataSource);
  await seedRootUser(dataSource);

  // app.useGlobalInterceptors()
  app.setGlobalPrefix('api');
  // 为了上传 base64 头像，加大传输上限
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  await app.listen(9000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
