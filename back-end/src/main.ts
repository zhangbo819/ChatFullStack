import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';
import { OnlineStatus, UserTable } from './users/users.entity';
import { root as rootUuid } from './interface';
import { genBase64ImageByName } from './utils';

// 增加 root 用户
// TODO migration 优化
async function seedRootUser(dataSource: DataSource) {
  const repo = dataSource.getRepository(UserTable);

  const existing = await repo.findOne({
    where: { name: 'zzb' },
  });

  if (!existing) {
    const root = repo.create({
      uuid: rootUuid,
      name: 'zzb',
      online: OnlineStatus.ONLINE,
      avatar: genBase64ImageByName('zzb'),
    });

    await repo.save(root);
    console.log('Root user created');
  }
}

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
