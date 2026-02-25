import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from 'src/users/users.module';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ConversationTable } from './entities/conversation.entity';
import { ConversationMemberTable } from './entities/conversation-member.entity';
import { MessageTable } from './entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConversationTable,
      ConversationMemberTable,
      MessageTable,
    ]),
    forwardRef(() => UsersModule),
  ],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
