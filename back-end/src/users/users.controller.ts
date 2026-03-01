import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { root } from '../interface';
import { UsersService } from './users.service';
import { FriendshipsService } from 'src/friendships/friendships.service';
import { decoratorUser } from 'src/auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly friendshipsService: FriendshipsService,
  ) {}

  // 获取指定用户的好友列表
  @Get('getUserList')
  async getUserList(
    @Query() Query: API_USER.GetUserList['params'],
  ): Promise<API_USER.GetUserList['res']> {
    const data = await this.usersService.getUserList(Query);
    return { errcode: 0, data };
  }

  // TODO 将本接口改为根据用户名查询的接口返回给前端选择的接口, 原来的 addFriend 接口应该放到 friendship 中
  // 添加好友
  @Get('addFriend')
  async addFriend(
    @decoratorUser() user,
    @Query() Query: API_USER.AddFriend['params'],
  ): Promise<API_USER.AddFriend['res']> {
    const selfUserId = user.id;

    const { userid: targetUserName } = Query;

    const resUser = await this.usersService.searchUserByName(targetUserName);

    // TODO 临时解决，应该在前端搞一个用户列表然后再选择，最后根据用户id来加
    if (resUser.length > 1) {
      throw new BadRequestException('所搜索用户名有重复');
    }

    return await this.friendshipsService.addFriend(selfUserId, resUser[0]?.id);
  }

  // 通过 token 获取用户信息
  @Get('getUserInfo')
  async getUserInfo(
    @decoratorUser() user,
  ): Promise<API_USER.getUserInfo['res']> {
    const userid = user.id;

    const res_user = await this.usersService.findOneById(userid);

    if (!res_user) {
      throw new UnauthorizedException();
    }

    return {
      errcode: 0,
      data: { name: res_user.name, id: res_user.id, avatar: res_user.avatar },
    };
  }

  // 获取指定 id 的用户信息
  @Get('getUserInfoById')
  async getUserInfoById(
    @Query() Query: API_USER.GetUserInfoById['params'],
  ): Promise<API_USER.GetUserInfoById['res']> {
    const userid = Query.id;

    const data = await this.usersService.findOneById(userid);

    return {
      errcode: 0,
      data: { name: data.name, id: data.id, avatar: data.avatar },
    };
  }

  // 更换头像
  @Post('changeAvatar')
  async changeAvatar(
    @decoratorUser() user,
    @Body() body: API_USER.ChangeAvatar['data'],
  ): Promise<API_USER.ChangeAvatar['res']> {
    return {
      errcode: 0,
      data: await this.usersService.changeAvatar(user.id, body.url),
    };
  }

  // root 用户强制其他用户下线
  @Get('putUserLoginout')
  async putUserLoginout(@decoratorUser() user, @Query() Query: { id: string }) {
    const userid = user.id;

    if (userid !== root) return { errcode: 403, message: '没有权限哦' };

    const res = await this.usersService.update(Query.id, { online: 0 });

    return { errcode: 0, data: res, message: res ? '成功' : '失败' };
  }
}
