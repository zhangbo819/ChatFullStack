import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CoreModule } from './core/core.module';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CoreModule,
    TasksModule,
    UsersModule,
    ChatModule,
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
