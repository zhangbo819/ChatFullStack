import { Controller, Get, Headers, Query } from '@nestjs/common';
import { root } from '../interface';
import { UsersService } from './users.service';
import { GetUserInfoByIdParams, User } from './interface';

@Controller('user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('putUserLoginout')
  async putUserLoginout(
    @Headers() headers: any,
    @Query() Query: { id: string },
  ) {
    const err = this.usersService.checkLogin(headers);
    if (err.errcode !== 0) return { ...err, data: undefined };

    const authorization = decodeURIComponent(
      headers.Authorization || headers.authorization || '',
    );

    if (authorization !== root) return { errcode: 403, message: '没有权限哦' };

    const res = this.usersService.update(Query.id, { online: 0 });

    return { errcode: 0, data: res, message: res ? '成功' : '失败' };
  }

  // 通过 token 获取用户信息
  @Get('getUserInfo')
  async getUserInfo(
    @Headers() headers: any,
    // @Query() Query: getChatListParams,
  ): Promise<CommonResponse<Partial<User> | undefined>> {
    const err = this.usersService.checkLogin(headers);
    if (err.errcode !== 0) return { ...err, data: undefined };
    const userid = decodeURIComponent(
      headers.Authorization || headers.authorization || '',
    );

    const data = await this.usersService.findOne(userid);

    return {
      errcode: 0,
      data: { name: data.name, id: data.id, avatar: data.avatar },
    };
  }

  // 获取指定 id 的用户信息
  @Get('getUserInfoById')
  async getUserInfoById(
    @Headers() headers: any,
    @Query() Query: GetUserInfoByIdParams,
  ): Promise<CommonResponse<Partial<User> | undefined>> {
    const err = this.usersService.checkLogin(headers);
    if (err.errcode !== 0) return { ...err, data: undefined };
    const userid = Query.id;

    const data = await this.usersService.findOne(userid);

    return {
      errcode: 0,
      data: { name: data.name, id: data.id, avatar: data.avatar },
    };
  }

  // 获取指定 id 的用户信息
  @Get('getGroupInfoById')
  async getGroupInfoById(
    @Headers() headers: any,
    @Query() Query: API_USER.GetGroupInfoById['params'],
  ): Promise<API_USER.GetGroupInfoById['res']> {
    const err = this.usersService.checkLogin(headers);
    if (err.errcode !== 0) return { ...err, data: undefined };
    const groupId = Query.id;

    const res = await this.usersService.getGroupInfoById(groupId);

    return res;
  }
}
