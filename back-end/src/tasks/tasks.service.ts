import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ChatService } from 'src/chat/chat.service';
import { map_chat_Type, map_message_Type } from 'src/interface';
import { UsersService } from 'src/users/users.service';
import { saveData } from 'src/utils';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private usersService: UsersService,
    private chatService: ChatService,
  ) {}

  // 定时任务，保存数据到本地文件，使用数据库的情况下已不需要
  // @Cron('0 0 * * * *')
  // async handleCron() {
  //   // 每个整点 保存一次数据
  //   this.logger.debug('CronJob in');
  //   const table_user = (await this.usersService.getTableUser()) || [];
  //   const table_group = this.usersService.getTableGroup() || [];
  //   const map_chat: map_chat_Type = this.chatService.getMapChat() || {};
  //   const map_message: map_message_Type =
  //     this.chatService.getMapMessage() || {};

  //   this.logger.debug(
  //     JSON.stringify(
  //       table_user.map((user) => ({
  //         ...user,
  //         avatar: user.avatar.slice(0, 20),
  //       })),
  //       null,
  //       4,
  //     ),
  //   );
  //   this.logger.debug(
  //     JSON.stringify(
  //       table_group.map((group) => ({
  //         ...group,
  //         avatar: group.avatar.slice(0, 20),
  //       })),
  //       null,
  //       4,
  //     ),
  //   );
  //   this.logger.debug(JSON.stringify(map_chat, null, 4));
  //   this.logger.debug(JSON.stringify(map_message, null, 4));

  //   const data = {
  //     time: Date.now(),
  //     table_user,
  //     table_group,
  //     map_chat,
  //     map_message,
  //   };
  //   saveData(JSON.stringify(data));
  // }

  // @Interval(10000)
  // handleInterval() {
  //   this.logger.debug('Called every 10 seconds');
  // }

  // @Timeout(5000)
  // handleTimeout() {
  //   this.logger.debug('Called once after 5 seconds');
  // }
}
