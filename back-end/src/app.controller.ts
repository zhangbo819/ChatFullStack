import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import {
  DataType,
  getChatListParams,
  root,
  sendMessageParams,
} from './interface';

interface CommonResponse<T = any> {
  errcode: number;
  message?: string;
  data?: T;
}

@Controller('/api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 某个人的消息列表
  @Get('getList')
  getList(
    @Headers() headers: any,
    @Query() Query: getChatListParams,
  ): CommonResponse<DataType[]> {
    const err = this.appService.checkLogin(headers);
    if (err.errcode !== 0) return { ...err, data: [] };
    return { errcode: 0, data: this.appService.getList(Query) };
  }

  // 发送消息
  @Post('postMessage')
  postMessage(
    @Headers() headers: any,
    @Body() data: sendMessageParams,
  ): CommonResponse {
    const err = this.appService.checkLogin(headers);
    if (err.errcode !== 0) return err;
    return { errcode: 0, data: this.appService.postMessage(data) };
  }

  // 登录
  @Post('userLogin')
  userLogin(
    @Body() data: { userid: string; rootCode?: string },
  ): CommonResponse {
    return this.appService.userLogin(data);
  }

  // 退出登录
  @Post('loginOut')
  loginOut(@Body() data: { userid: string }): CommonResponse {
    return this.appService.loginOut(data.userid);
  }

  // 获取用户列表
  @Get('getUserList')
  getUserList(
    @Headers() headers: any,
    @Query() Query,
  ): CommonResponse<string[]> {
    return this.appService.getUserList(headers, Query);
  }

  // 添加好友
  @Get('addFriend')
  addFriend(@Headers() headers: any, @Query() Query): CommonResponse<string[]> {
    const err = this.appService.checkLogin(headers);
    // console.log('getUserList err', err);
    if (err.errcode !== 0) return { ...err, data: [] };

    const user = decodeURIComponent(
      headers.Authorization || headers.authorization || '',
    );
    const { userid } = Query;

    return this.appService.addFriend(user, userid);
  }
}
