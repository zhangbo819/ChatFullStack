import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ChatService } from 'src/chat/chat.service';
import { UsersService } from 'src/users/users.service';
import { saveData } from 'src/utils';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private usersService: UsersService,
    private chatService: ChatService,
  ) {}

  @Cron('0 0 * * * *')
  handleCron() {
    // 每个整点 保存一次数据
    this.logger.debug('CronJob in');
    const table_user = this.usersService.getTableUser();
    const map_chat = this.chatService.getMapChat();

    this.logger.debug(JSON.stringify(table_user, null, 4));
    this.logger.debug(JSON.stringify(map_chat, null, 4));

    const data = {
      time: Date.now(),
      table_user,
      map_chat,
    };
    saveData(JSON.stringify(data));
  }

  // @Interval(10000)
  // handleInterval() {
  //   this.logger.debug('Called every 10 seconds');
  // }

  // @Timeout(5000)
  // handleTimeout() {
  //   this.logger.debug('Called once after 5 seconds');
  // }
}
