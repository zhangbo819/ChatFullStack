import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { decoratorUser } from 'src/auth/auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // 获取消息列表
  @Get('getMessageList')
  async getMessageList(
    @decoratorUser() user,
  ): Promise<API_CHAT.GetMessageList['res']> {
    return {
      errcode: 0,
      data: await this.chatService.getMessageList(user.id),
    };
  }

  // 根据会话id获取会话成员信息
  @Get('getConversationMemberInfos')
  async getConversationMemberInfos(
    @Query() Query: API_CHAT.GetConversationMemberInfos['params'],
  ): Promise<API_CHAT.GetConversationMemberInfos['res']> {
    return {
      errcode: 0,
      data: await this.chatService.getConversationMemberInfos(Query),
    };
  }

  // 某个人的聊天记录
  @Get('getChatList')
  async getChatList(
    @Query() Query: API_CHAT.getChatList['params'],
    @decoratorUser() user,
  ): Promise<API_CHAT.getChatList['res']> {
    return {
      errcode: 0,
      data: await this.chatService.getChatList(Query, user.id),
    };
  }

  // 发送消息 群/私
  @Post('sendMessage')
  async sendMessage(
    @Body() data: API_CHAT.sendMessage['params'],
    @decoratorUser() user,
  ): Promise<CommonResponse> {
    return {
      errcode: 0,
      data: await this.chatService.sendMessage(data, user.id),
    };
  }

  // 读消息 群/私
  @Post('readMessage')
  async readMessage(
    @Body() data: API_CHAT.ReadMessage['params'],
    @decoratorUser() user,
  ): Promise<CommonResponse> {
    return {
      errcode: 0,
      data: await this.chatService.readMessage(data, user.id),
    };
  }

  // 群聊
  // 创建群聊
  @Post('createGroup')
  async createGroup(
    @decoratorUser() user,
    @Body() data: API_CHAT.CreateGroup['params'],
  ): Promise<API_CHAT.CreateGroup['res']> {
    // console.log('user, data', user, data);

    return {
      errcode: 0,
      data: await this.chatService.createGroup(data, user.id),
    };
  }

  // 为群聊添加成员
  @Post('addGroupMember')
  async addGroupMember(
    @Body() data: API_CHAT.AddGroupMember['params'],
  ): Promise<API_CHAT.AddGroupMember['res']> {
    return {
      errcode: 0,
      data: await this.chatService.addGroupMember(data),
    };
  }

  // // 获取指定 id 的群信息
  // @Get('getGroupInfoById')
  // async getGroupInfoById(
  //   @Query() Query: API_CHAT.GetGroupInfoById['params'],
  // ): Promise<API_CHAT.GetGroupInfoById['res']> {
  //   const groupId = Query.id;

  //   const res = await this.chatService.getGroupInfoById(groupId);

  //   return res;
  // }
}
