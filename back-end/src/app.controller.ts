import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import {
  DataType,
  getChatListParams,
  root,
  sendMessageParams,
} from './interface';

const RootCode = 4396; // TODO

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
  getList(
    @Headers() headers: any,
    @Query() Query: getChatListParams,
  ): CommonResponse<DataType[]> {
    const err = checkLogin(this.users, headers);
    if (err.errcode !== 0) return { ...err, data: [] };
    return { errcode: 0, data: this.appService.getList(Query) };
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

  // 登录
  @Post('/api/userLogin')
  userLogin(
    // @Headers() headers: any,
    @Body() data: { userid: string; rootCode?: string },
  ): CommonResponse {
    if (data.userid === root) {
      // root
      if (Number(data.rootCode) !== RootCode) {
        return { errcode: 402, message: 'root 用户不可登录' };
      } else {
        return { errcode: 0, message: '成功' };
      }
    }

    if (this.users.includes(data.userid)) {
      return { errcode: 402, message: '用户已登录' };
    }

    this.users.push(data.userid);

    return { errcode: 0, message: '成功' };
  }

  // 退出登录
  @Post('/api/loginOut')
  loginOut(
    // @Headers() headers: any,
    @Body() data: { userid: string },
  ): CommonResponse {
    this.users = this.users.filter((i) => i !== data.userid || i === root);

    return { errcode: 0, message: '成功' };
  }

  @Get('/api/getUserList')
  getUserList(
    @Headers() headers: any,
    @Query() Query,
  ): CommonResponse<string[]> {
    const err = checkLogin(this.users, headers);
    if (err.errcode !== 0) return { ...err, data: [] };

    // console.log('Query.userid', Query.userid);
    // console.log('root', root);
    console.log('this.users', this.users);

    // TODO
    if (Query.userid === root) {
      return { errcode: 0, data: this.users };
    }

    return { errcode: 0, data: this.appService.getUserList(Query) };
  }
}
