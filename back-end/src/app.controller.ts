import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { DataType, root, sendMessageParams } from './interface';

const checkLogin = (users: string[], headers) => {
  let errcode = 0;
  const authorization = headers.Authorization || headers.authorization;
  if (!authorization || !users.includes(authorization)) {
    errcode = 401;
  }
  return { errcode, message: '用户未登录' };
};

interface CommonResponse<T = any> {
  errcode: number;
  message?: string;
  data?: T;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  private users = [root];

  @Get('/api/getList')
  getList(@Headers() headers: any): CommonResponse<DataType[]> {
    console.log('headers', headers);
    const err = checkLogin(this.users, headers);
    if (err.errcode !== 0) return { ...err, data: [] };
    return { errcode: 0, data: this.appService.getList() };
  }

  @Post('/api/postMessage')
  postMessage(
    @Headers() headers: any,
    @Body() data: sendMessageParams,
  ): CommonResponse {
    const err = checkLogin(this.users, headers);
    if (err.errcode !== 0) return err;
    return { errcode: 0, data: this.appService.postMessage(data) };
  }

  @Post('/api/userLogin')
  userLogin(
    @Headers() headers: any,
    @Body() data: { userid: string },
  ): CommonResponse {
    if (this.users.includes(data.userid)) {
      return { errcode: 402, message: '用户已登录' };
    }

    this.users.push(data.userid);

    return { errcode: 0, message: '成功' };
  }
}
