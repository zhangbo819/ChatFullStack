import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // 获取消息列表
  @Get('getMessageList')
  async getMessageList(
    @Query() Query: API_CHAT.GetMessageList['params'],
  ): Promise<API_CHAT.GetMessageList['res']> {
    return { errcode: 0, data: await this.chatService.getMessageList(Query) };
  }

  // 某个人的聊天记录
  @Get('getChatList')
  getChatList(
    @Query() Query: API_CHAT.getChatList['params'],
  ): API_CHAT.getChatList['res'] {
    return { errcode: 0, data: this.chatService.getChatList(Query) };
  }

  // 发送消息 群/私
  @Post('sendMessage')
  async sendMessage(
    @Body() data: API_CHAT.sendMessage['params'],
  ): Promise<CommonResponse> {
    return { errcode: 0, data: await this.chatService.sendMessage(data) };
  }

  // 读消息 群/私
  @Post('readMessage')
  async readMessage(
    @Body() data: API_CHAT.ReadMessage['params'],
  ): Promise<CommonResponse> {
    return { errcode: 0, data: await this.chatService.readMessage(data) };
  }
}
