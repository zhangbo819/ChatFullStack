import { Injectable } from '@nestjs/common';
import {
  DataType,
  getChatListParams,
  map_chat_Type,
  sendMessageParams,
  map_message_Type,
} from 'src/interface';
import { UsersService } from 'src/users/users.service';
import { getChatKey, loadData } from 'src/utils';

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
  // 聊天记录 map
  private map_chat: map_chat_Type = map_chat;
  // 消息 map
  private map_message: map_message_Type = map_message;

  constructor(private usersService: UsersService) {}

  getMapChat() {
    return this.map_chat;
  }

  getMapMessage() {
    return this.map_message;
  }

  // 检查用户是否登录
  checkLogin(headers: Record<string, any>) {
    let errcode = 0;
    let message = '';
    const authorization = decodeURIComponent(
      headers.Authorization || headers.authorization || '',
    );
    const user_ids = this.usersService.getOnlineUserIds();
    // console.log('checkLogin user_ids', user_ids);
    if (!authorization || !user_ids.includes(authorization)) {
      errcode = 401;
      message = '用户未登录';
    }
    return { errcode, message, data: [] };
  }

  // 获取消息列表
  async getMessageList(
    params: API_CHAT.GetMessageList['params'],
  ): Promise<API_CHAT.GetMessageList['resData']> {
    const { id } = params;

    // 新版
    const userid = id;

    // map 里没有的情况，根据好友列表和群列表生成
    if (
      !this.map_message[userid] ||
      Object.keys(this.map_message[userid]).length === 0
    ) {
      const userMap = {};

      // 个人
      const user_friends = this.usersService.getUserFriends();
      const table_user = this.usersService.getTableUser();
      table_user
        .filter((item) => (user_friends[id] || []).includes(item.id))
        .forEach(
          ({ id }) => (userMap[id] = { count: 0, lastMsg: '', time: 0 }), // TODO init time
        );

      // 群
      const tableGroup = this.usersService.getTableGroup();
      tableGroup
        .filter((group) => group.member.includes(id))
        .forEach(
          ({ id }) => (userMap[id] = { count: 0, lastMsg: '', time: 0 }),
        );

      console.log('userMap', userMap);

      this.map_message[userid] = userMap;
    }

    // 根据 map_message 生成最终数据
    const data: API_CHAT.GetMessageList['resItem'][] = [];
    for (const key in this.map_message[userid]) {
      const item = this.map_message[userid][key];

      const user = await this.usersService.findOne(key);
      const isGroup = !user;
      let name = '',
        avatar = '';
      if (isGroup) {
        const group = await this.usersService.findOneGroup(key);
        if (!group) break;
        name = group.name;
        avatar = group.avatar;
      } else {
        name = user.name;
        avatar = user.avatar;
      }
      data.push({ ...item, isGroup: isGroup ? 1 : 0, id: key, name, avatar });
    }

    return data;
  }

  // 获取聊天记录列表
  getChatList(params: getChatListParams): DataType[] {
    const { to, form, isGroup } = params;
    console.log('获取聊天记录列表');
    // console.log('to, form', to, form);
    // console.log('this.data', JSON.stringify(this.data, null, 4));

    const key = getChatKey(to, form, isGroup);

    console.log(this.map_chat[key]);

    return this.map_chat[key] || [];
  }

  // 发送消息
  async postMessage(params: sendMessageParams): Promise<null> {
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
  private async _saveMessage(params: sendMessageParams) {
    const { to, form, addData, isGroup } = params;
    // 产生消息
    if (+isGroup) {
      // 群
      const groupId = to;
      // 除了 发送者 所有群成员产生一条未读信息
      const group = await this.usersService.findOneGroup(groupId);

      const member = group.member.filter((id) => id !== form);

      member.forEach((userid) => {
        this._saveOneMessage(userid, groupId, addData);
      });
    } else {
      // 私聊
      // 被发送的人 产生了一条未读信息
      this._saveOneMessage(to, form, addData);
    }
  }

  // 产生单条未读信息
  private _saveOneMessage(
    targetUserId: string,
    sendUserId: string,
    addData: DataType[],
  ) {
    const targetUser = this.map_message[targetUserId] || {};
    const target = targetUser[sendUserId] || { count: 0, lastMsg: '', time: 0 };
    if (target) {
      target.count += addData.length;
      target.lastMsg = addData[addData.length - 1].msg;
      target.time = Date.now();
    } else {
      console.log(
        'saveMessage err targetUserId, sendUserId',
        targetUserId,
        sendUserId,
      );
    }
  }

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
