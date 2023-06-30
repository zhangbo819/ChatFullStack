import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { DataType, getChatListParams, sendMessageParams } from '../interface';
import { ChatService } from './chat.service';

interface CommonResponse<T = any> {
  errcode: number;
  message?: string;
  data?: T;
}

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // 某个人的消息列表
  @Get('getList')
  getList(
    @Headers() headers: any,
    @Query() Query: getChatListParams,
  ): CommonResponse<DataType[]> {
    const err = this.chatService.checkLogin(headers);
    if (err.errcode !== 0) return { ...err, data: [] };
    return { errcode: 0, data: this.chatService.getList(Query) };
  }

  // 发送消息
  @Post('postMessage')
  postMessage(
    @Headers() headers: any,
    @Body() data: sendMessageParams,
  ): CommonResponse {
    const err = this.chatService.checkLogin(headers);
    if (err.errcode !== 0) return err;
    return { errcode: 0, data: this.chatService.postMessage(data) };
  }

  // 登录
  @Post('userLogin')
  async userLogin(
    @Body() data: { userName: string; rootCode?: string },
  ): Promise<CommonResponse> {
    return await this.chatService.userLogin(data);
  }

  // 退出登录
  @Post('loginOut')
  async loginOut(@Body() data: { userid: string }): Promise<CommonResponse> {
    return await this.chatService.loginOut(data.userid);
  }

  // 获取用户列表
  @Get('getUserList')
  getUserList(
    @Headers() headers: any,
    @Query() Query,
  ): CommonResponse<{ id: string; name: string }[]> {
    return this.chatService.getUserList(headers, Query);
  }

  // 添加好友
  @Get('addFriend')
  async addFriend(
    @Headers() headers: any,
    @Query() Query,
  ): Promise<CommonResponse<string[]>> {
    const err = this.chatService.checkLogin(headers);
    // console.log('getUserList err', err);
    if (err.errcode !== 0) return { ...err, data: [] };

    const user = decodeURIComponent(
      headers.Authorization || headers.authorization || '',
    );
    const { userid } = Query;

    return await this.chatService.addFriend(user, userid);
  }
}
