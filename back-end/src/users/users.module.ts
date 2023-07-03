import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
// import { ChatModule } from 'src/chat/chat.module';

@Module({
  // imports: [ChatModule],
  providers: [UsersService],
  controllers: [UserController],
  exports: [UsersService],
})
export class UsersModule {}
