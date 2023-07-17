import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
// import { AuthModule } from 'src/auth/auth.module';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [forwardRef(() => ChatModule)],
  providers: [UsersService],
  controllers: [UserController],
  exports: [UsersService],
})
export class UsersModule {}
