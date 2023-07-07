import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { DataType, getChatListParams, sendMessageParams } from '../interface';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // 获取消息列表
  @Get('getMessageList')
  async getMessageList(
    @Headers() headers: any,
    @Query() Query: API_CHAT.GetMessageList['params'],
  ): Promise<API_CHAT.GetMessageList['res']> {
    const err = this.chatService.checkLogin(headers);
    if (err.errcode !== 0) return { ...err, data: [] };
    return { errcode: 0, data: await this.chatService.getMessageList(Query) };
  }

  // 某个人的聊天记录
  @Get('getChatList')
  getChatList(
    @Headers() headers: any,
    @Query() Query: getChatListParams,
  ): CommonResponse<DataType[]> {
    const err = this.chatService.checkLogin(headers);
    if (err.errcode !== 0) return { ...err, data: [] };
    return { errcode: 0, data: this.chatService.getChatList(Query) };
  }

  // 发送消息 群/私
  @Post('postMessage')
  async postMessage(
    @Headers() headers: any,
    @Body() data: sendMessageParams,
  ): Promise<CommonResponse> {
    const err = this.chatService.checkLogin(headers);
    if (err.errcode !== 0) return err;
    return { errcode: 0, data: await this.chatService.postMessage(data) };
  }

  // 读消息 群/私
  @Post('readMessage')
  async readMessage(
    @Headers() headers: any,
    @Body() data: API_CHAT.ReadMessage['params'],
  ): Promise<CommonResponse> {
    const err = this.chatService.checkLogin(headers);
    if (err.errcode !== 0) return err;
    return { errcode: 0, data: await this.chatService.readMessage(data) };
  }
}
