import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { root } from '../interface';
import { UsersService } from './users.service';

@Controller('user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  // 获取用户列表
  @Get('getUserList')
  getUserList(
    @Query() Query: API_USER.GetUserList['params'],
  ): API_USER.GetUserList['res'] {
    return { errcode: 0, data: this.usersService.getUserList(Query) };
  }

  // 添加好友
  @Get('addFriend')
  async addFriend(
    @Request() request,
    @Query() Query: API_USER.AddFriend['params'],
  ): Promise<API_USER.AddFriend['res']> {
    const selfUserId = request.user.id;

    const { userid } = Query;

    return await this.usersService.addFriend(selfUserId, userid);
  }

  // 通过 token 获取用户信息
  @Get('getUserInfo')
  async getUserInfo(@Request() request): Promise<API_USER.getUserInfo['res']> {
    const userid = request.user.id;

    const user = await this.usersService.findOne(userid);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      errcode: 0,
      data: { name: user.name, id: user.id, avatar: user.avatar },
    };
  }

  // 获取指定 id 的用户信息
  @Get('getUserInfoById')
  async getUserInfoById(
    @Query() Query: API_USER.GetUserInfoById['params'],
  ): Promise<API_USER.GetUserInfoById['res']> {
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
    @Request() request,
    @Body() body: API_USER.ChangeAvatar['data'],
  ): Promise<API_USER.ChangeAvatar['res']> {
    const userid = request.user.id;

    return {
      errcode: 0,
      data: await this.usersService.changeAvatar(userid, body.url),
    };
  }

  // root 用户强制其他用户下线
  @Get('putUserLoginout')
  async putUserLoginout(@Request() request, @Query() Query: { id: string }) {
    const userid = request.user.id;

    if (userid !== root) return { errcode: 403, message: '没有权限哦' };

    const res = this.usersService.update(Query.id, { online: 0 });

    return { errcode: 0, data: res, message: res ? '成功' : '失败' };
  }

  // 群聊
  // 创建群聊
  @Post('createGroup')
  async createGroup(
    @Body() data: API_USER.createGroup['params'],
  ): Promise<API_USER.createGroup['res']> {
    return { errcode: 0, data: await this.usersService.createGroup(data) };
  }

  // 为群聊添加成员
  @Post('addGroupMember')
  async addGroupMember(
    @Body() data: API_USER.AddGroupMember['params'],
  ): Promise<API_USER.AddGroupMember['res']> {
    return {
      errcode: 0,
      data: await this.usersService.addGroupMember(data),
    };
  }

  // 获取指定 id 的群信息
  @Get('getGroupInfoById')
  async getGroupInfoById(
    @Query() Query: API_USER.GetGroupInfoById['params'],
  ): Promise<API_USER.GetGroupInfoById['res']> {
    const groupId = Query.id;

    const res = await this.usersService.getGroupInfoById(groupId);

    return res;
  }
}
