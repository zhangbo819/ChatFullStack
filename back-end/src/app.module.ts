import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from './core/core.module';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { FriendshipsModule } from './friendships/friendships.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'nestdb',
      // TODO 环境变量配置
      // host: process.env.DB_HOST,
      // port: Number(process.env.DB_PORT) || 5432,
      // username: process.env.DB_USER,
      // password: process.env.DB_PASSWORD,
      // database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, // 开发环境可开，生产必须关
    }),
    ScheduleModule.forRoot(),
    CoreModule,
    TasksModule,
    AuthModule,
    UsersModule,
    ChatModule,
    FriendshipsModule,
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
