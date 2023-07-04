import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { User } from 'src/users/interface';
import {
  AddGroupMember,
  CommonResponse,
  DataType,
  createGroupParams,
  createGroupRes,
  getChatListParams,
  GetUserList,
  sendMessageParams,
} from '../interface';
import { ChatService } from './chat.service';
import { GetMessageList } from './interface';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // 获取消息列表
  @Get('getMessageList')
  async getMessageList(
    @Headers() headers: any,
    @Query() Query: GetMessageList.params,
  ): Promise<GetMessageList.res> {
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
  postMessage(
    @Headers() headers: any,
    @Body() data: sendMessageParams,
  ): CommonResponse {
    const err = this.chatService.checkLogin(headers);
    if (err.errcode !== 0) return err;
    return { errcode: 0, data: this.chatService.postMessage(data) };
  }

  // TODO move to auth
  // 登录
  @Post('userLogin')
  async userLogin(
    @Body() data: { userName: string; rootCode?: string },
  ): Promise<CommonResponse<Partial<User>>> {
    return await this.chatService.userLogin(data);
  }

  // TODO move to auth
  // 退出登录
  @Post('loginOut')
  async loginOut(@Body() data: { userid: string }): Promise<CommonResponse> {
    return await this.chatService.loginOut(data.userid);
  }

  // TODO move to users
  // 获取用户列表
  @Get('getUserList')
  getUserList(
    @Headers() headers: any,
    @Query() Query: GetUserList.params,
  ): GetUserList.res {
    return this.chatService.getUserList(headers, Query);
  }

  // TODO move to users
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

  // 创建群聊
  @Post('createGroup')
  async createGroup(
    @Headers() headers: any,
    @Body() data: createGroupParams,
  ): Promise<createGroupRes> {
    const err = this.chatService.checkLogin(headers);
    if (err.errcode !== 0) return err as any; // TODO err type
    return { errcode: 0, data: await this.chatService.createGroup(data) };
  }

  // 为群聊添加成员
  @Post('addGroupMember')
  async addGroupMember(
    @Headers() headers: any,
    @Body() data: AddGroupMember.params,
  ): Promise<AddGroupMember.res> {
    const err = this.chatService.checkLogin(headers);
    if (err.errcode !== 0) return err as any; // TODO err type
    return {
      errcode: 0,
      data: await this.chatService.addGroupMember(data),
    };
  }
}
