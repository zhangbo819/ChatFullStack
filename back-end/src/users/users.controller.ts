import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { createGroupParams, createGroupRes, root } from '../interface';
import { UsersService } from './users.service';
import { GetUserInfoByIdParams, User } from './interface';
import { AuthService } from 'src/auth/auth.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  // 获取用户列表
  @Get('getUserList')
  getUserList(
    @Headers() headers: any,
    @Query() Query: API_USER.GetUserList['params'],
  ): API_USER.GetUserList['res'] {
    const err = this.authService.checkLogin(headers);
    if (err.errcode !== 0) return { ...err, data: [] };
    return { errcode: 0, data: this.usersService.getUserList(Query) };
  }

  // 添加好友
  @Get('addFriend')
  async addFriend(
    @Headers() headers: any,
    @Query() Query,
  ): Promise<CommonResponse<string[]>> {
    const err = this.authService.checkLogin(headers);
    // console.log('getUserList err', err);
    if (err.errcode !== 0) return { ...err, data: [] };

    const user = decodeURIComponent(
      headers.Authorization || headers.authorization || '',
    );
    const { userid } = Query;

    return await this.usersService.addFriend(user, userid);
  }

  // 通过 token 获取用户信息
  @Get('getUserInfo')
  async getUserInfo(
    @Headers() headers: any,
    // @Query() Query: getChatListParams,
  ): Promise<CommonResponse<Partial<User> | undefined>> {
    const err = this.authService.checkLogin(headers);
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
    const err = this.authService.checkLogin(headers);
    if (err.errcode !== 0) return { ...err, data: undefined };
    const userid = Query.id;

    const data = await this.usersService.findOne(userid);

    return {
      errcode: 0,
      data: { name: data.name, id: data.id, avatar: data.avatar },
    };
  }

  // 更换头像
  @Post('changeAvatar')
  async changeAvatar(
    @Headers() headers: any,
    @Body() body: API_USER.ChangeAvatar['data'],
  ): Promise<API_USER.ChangeAvatar['res']> {
    const err = this.authService.checkLogin(headers);
    if (err.errcode !== 0) return { ...err, data: undefined };

    const userid = decodeURIComponent(
      headers.Authorization || headers.authorization || '',
    );

    return {
      errcode: 0,
      data: await this.usersService.changeAvatar(userid, body.url),
    };
  }

  // root 用户强制其他用户下线
  @Get('putUserLoginout')
  async putUserLoginout(
    @Headers() headers: any,
    @Query() Query: { id: string },
  ) {
    const err = this.authService.checkLogin(headers);
    if (err.errcode !== 0) return { ...err, data: undefined };

    const authorization = decodeURIComponent(
      headers.Authorization || headers.authorization || '',
    );

    if (authorization !== root) return { errcode: 403, message: '没有权限哦' };

    const res = this.usersService.update(Query.id, { online: 0 });

    return { errcode: 0, data: res, message: res ? '成功' : '失败' };
  }

  // 群聊
  // 创建群聊
  @Post('createGroup')
  async createGroup(
    @Headers() headers: any,
    @Body() data: createGroupParams,
  ): Promise<createGroupRes> {
    const err = this.authService.checkLogin(headers);
    if (err.errcode !== 0) return err as any; // TODO err type
    return { errcode: 0, data: await this.usersService.createGroup(data) };
  }

  // 为群聊添加成员
  @Post('addGroupMember')
  async addGroupMember(
    @Headers() headers: any,
    @Body() data: API_USER.AddGroupMember['params'],
  ): Promise<API_USER.AddGroupMember['res']> {
    const err = this.authService.checkLogin(headers);
    if (err.errcode !== 0) return err as any; // TODO err type
    return {
      errcode: 0,
      data: await this.usersService.addGroupMember(data),
    };
  }

  // 获取指定 id 的群信息
  @Get('getGroupInfoById')
  async getGroupInfoById(
    @Headers() headers: any,
    @Query() Query: API_USER.GetGroupInfoById['params'],
  ): Promise<API_USER.GetGroupInfoById['res']> {
    const err = this.authService.checkLogin(headers);
    if (err.errcode !== 0) return { ...err, data: undefined };
    const groupId = Query.id;

    const res = await this.usersService.getGroupInfoById(groupId);

    return res;
  }
}
