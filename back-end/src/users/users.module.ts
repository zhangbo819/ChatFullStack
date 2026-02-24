import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTable } from './users.entity';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
// import { AuthModule } from 'src/auth/auth.module';
import { ChatModule } from 'src/chat/chat.module';
import { FriendshipsModule } from 'src/friendships/friendships.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserTable]),
    forwardRef(() => ChatModule),
    forwardRef(() => FriendshipsModule),
  ],
  providers: [UsersService],
  controllers: [UserController],
  exports: [UsersService],
})
export class UsersModule {}
