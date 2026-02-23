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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'nestdb',
      autoLoadEntities: true,
      synchronize: true, // 开发环境可开，生产必须关
    }),
    ScheduleModule.forRoot(),
    CoreModule,
    TasksModule,
    AuthModule,
    UsersModule,
    ChatModule,
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
