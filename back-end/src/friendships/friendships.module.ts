import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FriendshipsService } from './friendships.service';
import { FriendshipsController } from './friendships.controller';
import { FriendshipTable } from './entities/friendship.entity';
import { ChatModule } from 'src/chat/chat.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendshipTable]),
    forwardRef(() => ChatModule),
    forwardRef(() => UsersModule),
  ],
  providers: [FriendshipsService],
  controllers: [FriendshipsController],
  exports: [FriendshipsService],
})
export class FriendshipsModule {}
