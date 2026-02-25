import { Repository } from 'typeorm';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { map_chat_Type, map_message_Type } from 'src/interface';
import { UsersService } from 'src/users/users.service';
import { getChatKey, loadData } from 'src/utils';
import {
  ConversationTable,
  ConversationType,
} from './entities/conversation.entity';
import { ConversationMemberTable } from './entities/conversation-member.entity';
import { MessageTable } from './entities/message.entity';

// 临时方案
const historyData = loadData() || {};
// 聊天记录表 map 形式
const map_chat: map_chat_Type = historyData.map_chat || {};
// 消息列表 map 形式
const map_message: map_message_Type = historyData.map_message || {};
// const map_message = {
//   ["userId"]: {
//     ["person1Id"]: { count: 0, lastMsg: "", time: 0 },
//     ["person2Id"]: { count: 3, lastMsg: "第三方", time: 0 },
//     ["group1Id"]: { count: 10, lastMsg: "地方", time: 0 },
//     ["group2Id"]: { count: 1, lastMsg: "..", time: 0 },
//   },
// };

@Injectable()
export class ChatService {
  // TODO 扩展 消息已读表
  // 聊天记录 map
  private map_chat: map_chat_Type = map_chat;
  // 消息 map
  private map_message: map_message_Type = map_message;

  constructor(
    @InjectRepository(ConversationTable)
    private readonly conversationRepo: Repository<ConversationTable>,

    @InjectRepository(ConversationMemberTable)
    private readonly conversationMemberRepo: Repository<ConversationMemberTable>,

    @InjectRepository(MessageTable)
    private readonly messageRepo: Repository<MessageTable>,

    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  // 创建私聊会话
  async createPrivateConversation(
    userIdA: string,
    userIdB: string,
  ): Promise<ConversationTable> {
    const [u1, u2] = [userIdA, userIdB].sort();
    const privateKey = u1 + '_' + u2;

    // 创建私聊会话
    const conversation = this.conversationRepo.create({
      type: ConversationType.PRIVATE,
      privateKey,
      memberCount: 2, // 私聊必定是两个人，用处不大
    });
    await this.conversationRepo.save(conversation);

    // 把私聊用户添加到会话成员表
    const user1 = await this.usersService.findOne(u1);
    const conversationMember1 = this.conversationMemberRepo.create({
      conversation,
      user: user1,
    });
    await this.conversationMemberRepo.save(conversationMember1);
    const user2 = await this.usersService.findOne(u2);
    const conversationMember2 = this.conversationMemberRepo.create({
      conversation,
      user: user2,
    });
    await this.conversationMemberRepo.save(conversationMember2);

    return conversation;
  }

  // public getMapChat() {
  //   return this.map_chat;
  // }

  // public getMapMessage() {
  //   return this.map_message;
  // }

  // 获取消息列表
  async getMessageList(
    params: API_CHAT.GetMessageList['params'],
  ): Promise<API_CHAT.GetMessageList['resData']> {
    const { id: userId } = params;

    // // map 里没有的情况，根据好友列表和群列表生成
    // if (
    //   !this.map_message[userid] ||
    //   Object.keys(this.map_message[userid]).length === 0
    // ) {
    //   const userMap = {};

    //   // 个人
    //   const table_user = await this.usersService.getTableUser();
    //   const user_friends = this.usersService.getUserFriends(table_user);
    //   // console.log('user_friends[id]', user_friends[id]);
    //   table_user
    //     .filter((item) => (user_friends[id] || []).includes(item.id))
    //     .forEach(({ id }) => this.initUserMessage(userid, id));

    //   // 群
    //   const tableGroup = this.usersService.getTableGroup();
    //   tableGroup
    //     .filter((group) => group.member.includes(id))
    //     .forEach(({ id }) => this.initUserMessage(userid, id));

    //   console.log('userMap', userMap);

    //   this.map_message[userid] = userMap;
    // }

    // // 根据 map_message 生成最终数据
    // const data: API_CHAT.GetMessageList['resItem'][] = [];
    // console.log('this.map_message[userid]', this.map_message, userid);
    // for (const key in this.map_message[userid]) {
    //   const item = this.map_message[userid][key];

    //   const user = await this.usersService.findOne(key);
    //   const isGroup = !user;
    //   let name = '',
    //     avatar = '';
    //   if (isGroup) {
    //     const group = await this.usersService.findOneGroup(key);
    //     if (!group) break;
    //     name = group.name;
    //     avatar = group.avatar;
    //   } else {
    //     name = user.name;
    //     avatar = user.avatar;
    //   }
    //   data.push({ ...item, isGroup: isGroup ? 1 : 0, id: key, name, avatar });
    // }

    // 查询私聊会话
    // const user = await this.usersService.findOne(userid);

    // 自己加入的会话
    // const conversationMembers = await this.conversationMemberRepo.find({
    //   where: { user },
    // });

    // const private_user_ids = []; // 跟自己私聊的用户
    // conversationMembers.forEach((conversationMember) => {
    //   if (conversationMember.conversation.type === ConversationType.PRIVATE) {
    //     // 私聊
    //     const [u1, u2] = conversationMember.conversation.privateKey.split('_');
    //     u1 === user.id ? private_user_ids.push(u2) : private_user_ids.push(u1);
    //   } else if (
    //     conversationMember.conversation.type === ConversationType.GROUP
    //   ) {
    //     // TODO 群聊
    //   }
    // });

    // TODO v1, count lastMsg time
    const data = await this.conversationMemberRepo
      .createQueryBuilder('cm1')
      .innerJoin('cm1.conversation', 'c')

      // 找到同会话的其他成员（用于私聊）
      .leftJoin(
        ConversationMemberTable,
        'cm2',
        'cm1.conversation_id = cm2.conversation_id AND cm2.user_id != cm1.user_id',
      )
      .leftJoin('cm2.user', 'u')

      .where('cm1.user_id = :userId', { userId })

      .select([
        'c.id AS id',
        `CASE 
        WHEN c.type = 'group' THEN c.name
        ELSE u.name
      END AS name`,
        `CASE 
        WHEN c.type = 'group' THEN c.avatar
        ELSE u.avatar
      END AS avatar`,
      ])
      .getRawMany();

    console.log('data', data);

    const ResData: API_CHAT.GetMessageList['resItem'][] = [...data];

    return ResData;
  }

  // 获取聊天记录列表
  getChatList(params: API_CHAT.getChatList['params']): API_CHAT.DataType[] {
    const { to, form, isGroup } = params;
    console.log('获取聊天记录列表');
    // console.log('to, form', to, form);
    // console.log('this.data', JSON.stringify(this.data, null, 4));

    const key = getChatKey(to, form, isGroup);

    console.log(this.map_chat[key]);

    return this.map_chat[key] || [];
  }

  // 发送消息
  async sendMessage(params: API_CHAT.sendMessage['params']): Promise<null> {
    const { to, form, addData, isGroup } = params;

    const key = getChatKey(to, form, isGroup);

    // 保存聊天记录
    if (this.map_chat[key]) {
      this.map_chat[key].push(...addData);
    } else {
      this.map_chat[key] = addData;
    }

    // 产生消息
    await this._saveMessage(params);

    return null;
  }

  // 保存产生的消息
  private async _saveMessage(params: API_CHAT.sendMessage['params']) {
    const { to, form, addData, isGroup } = params;
    // 产生消息
    if (+isGroup) {
      // 群
      const groupId = to;
      // 除了 发送者 所有群成员产生一条未读信息
      const group = await this.usersService.findOneGroup(groupId);

      const member = group.member;
      // .filter((id) => id !== form);

      member.forEach((userid) => {
        this._saveOneMessage(userid, groupId, addData, userid === form);
      });
    } else {
      // 私聊
      // 被发送的人 产生了一条未读信息
      this._saveOneMessage(to, form, addData);
    }
  }

  // 产生单条未读(或已读)信息
  private _saveOneMessage(
    targetUserId: string,
    sendUserId: string,
    addData: API_CHAT.DataType[],
    isRead?: boolean, // 是否是已读
  ) {
    if (!this.map_message[targetUserId]) {
      // 数据先产生，防止该用户还没调消息列表接口，导致数据缺失
      this.map_message[targetUserId] = {};
    }
    const targetUser = this.map_message[targetUserId];
    if (!targetUser[sendUserId]) {
      targetUser[sendUserId] = { count: 0, lastMsg: '', time: 0 };
    }
    const target = targetUser[sendUserId];
    if (!isRead) {
      // 未读
      target.count += addData.length;
    }
    target.lastMsg = addData[addData.length - 1].msg;
    target.time = Date.now();
  }

  // // 为指定的用户初始化一条(用户或群)信息
  // async initUserMessage(selfUserId: string, targetId: string) {
  //   // console.log('initUserMessage', selfUserId, targetId);
  //   // console.log('this.map_message', this.map_message);
  //   if (!this.map_message[selfUserId]) {
  //     this.map_message[selfUserId] = {};
  //   }
  //   const user_message = this.map_message[selfUserId];
  //   // console.log('user_message', user_message);
  //   if (!user_message[targetId]) {
  //     // 初始化一条
  //     user_message[targetId] = { count: 0, lastMsg: '', time: 0 };
  //     // console.log('this.map_message after', this.map_message);
  //   }
  // }

  // 读消息 群/私
  readMessage(data: API_CHAT.ReadMessage['params']) {
    const { userid, targetId } = data;
    if (!this.map_message[userid]) return '该用户不存在';
    if (!this.map_message[userid][targetId]) return '该消息不存在';

    if (this.map_message[userid][targetId].count > 0) {
      this.map_message[userid][targetId].count = 0;
      this.map_message[userid][targetId].time = Date.now();
    }
    return '成功';
  }
}
