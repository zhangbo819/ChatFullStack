import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { UsersModule } from 'src/users/users.module';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [UsersModule, ChatModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
