import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import {
  AddGroupMember,
  DataType,
  RootCode,
  createGroupParams,
  getChatListParams,
  GetUserList,
  map_chat_Type,
  root,
  sendMessageParams,
  map_message_Type,
} from 'src/interface';
import { UsersService } from 'src/users/users.service';
import { genBase64ImageByName, getChatKey, loadData } from 'src/utils';
import { GetMessageList, ReadMessage } from './chat.interface';

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

  // 获取最新的在线用户 id，方便后期改成数据库的形式
  private _getOnlineUserIds() {
    const table_user = this.usersService.getTableUser();
    return table_user.filter((i) => i.online === 1).map((i) => i.id);
  }

  // 获取用户好友映射 map
  private _getUserFriends() {
    const table_user = this.usersService.getTableUser();

    return table_user.reduce((r, i) => {
      r[i.id] = i.friends;
      return r;
    }, {});
  }

  // 检查用户是否登录
  checkLogin(headers: Record<string, any>) {
    let errcode = 0;
    let message = '';
    const authorization = decodeURIComponent(
      headers.Authorization || headers.authorization || '',
    );
    const user_ids = this._getOnlineUserIds();
    // console.log('checkLogin user_ids', user_ids);
    if (!authorization || !user_ids.includes(authorization)) {
      errcode = 401;
      message = '用户未登录';
    }
    return { errcode, message, data: [] };
  }

  // 登录
  async userLogin(data: { userName: string; rootCode?: string }) {
    const { userName } = data;

    const table_user = this.usersService.getTableUser();
    const defaultData = {};

    const rootUser = await this.usersService.findOne(root);
    if (userName === rootUser.name) {
      // root
      if (data.rootCode !== RootCode) {
        return {
          errcode: 402,
          message: 'root 用户不可登录',
          data: defaultData,
        };
      } else {
        return { errcode: 0, message: '成功', data: { id: root, name: 'zzb' } };
      }
    }

    let userData = table_user.find((i) => i.name === userName);

    if (userData && userData.online === 1) {
      return { errcode: 402, message: '用户已登录', data: defaultData };
    }

    if (!userData) {
      const id = v4(userName);
      //   this.table_user.push(userData);
      userData = await this.usersService.add({
        id,
        name: userName,
        friends: [root],
        online: 1,
        avatar: genBase64ImageByName(userName),
      });
      const rootUser = await this.usersService.findOne(root);
      rootUser.friends.push(id);
    } else {
      await this.usersService.update(userData.id, { online: 1 });
    }

    const { avatar, ...log } = userData;

    console.log('登录成功', log, avatar.slice(0, 20));

    return {
      errcode: 0,
      message: '成功',
      data: { id: userData.id, name: userData.name, avatar: userData.avatar },
    };
  }

  // 退出登录
  async loginOut(userid: string) {
    // this.users = this.users.filter((i) => i !== userid || i === root);
    const target_user = await this.usersService.findOne(userid);
    if (!target_user) {
      return { errcode: 401, mesaage: '用户不存在，请重新登录', data: [] };
    }

    if (userid !== root) {
      await this.usersService.update(userid, { online: 0 });
    }

    return { errcode: 0, message: '成功', data: [] };
  }

  // 获取消息列表
  async getMessageList(
    params: GetMessageList.params,
  ): Promise<GetMessageList.resData> {
    const { id } = params;

    // 新版
    const userid = id;

    // map 里没有的情况，根据好友列表和群列表生成
    if (!this.map_message[userid]) {
      const userMap = {};

      // 个人
      const user_friends = this._getUserFriends();
      const table_user = this.usersService.getTableUser();
      table_user
        .filter((item) => (user_friends[id] || []).includes(item.id))
        .forEach(
          ({ id }) => (userMap[id] = { count: 0, lastMsg: '', time: 0 }),
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
    const data: GetMessageList.resItem[] = [];
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
    await this.saveMessage(params);

    return null;
  }

  // 保存产生的消息
  private async saveMessage(params: sendMessageParams) {
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
  readMessage(data: ReadMessage.params) {
    const { userid, targetId } = data;
    if (!this.map_message[userid]) return '该用户不存在';
    if (!this.map_message[userid][targetId]) return '该消息不存在';

    if (this.map_message[userid][targetId].count > 0) {
      this.map_message[userid][targetId].count = 0;
      this.map_message[userid][targetId].time = Date.now();
    }
    return '成功';
  }

  // 获取用户列表
  getUserList(headers, Query: GetUserList.params) {
    // console.log('headers, Query', headers, Query);
    const err = this.checkLogin(headers);
    if (err.errcode !== 0) return { ...err, data: [] };

    // console.log('this.users', this.users);

    const { userid } = Query;

    const user_friends = this._getUserFriends();

    const table_user = this.usersService.getTableUser();

    const data = table_user
      .filter((item) => (user_friends[userid] || []).includes(item.id))
      .map((i) => {
        const obj: GetUserList.Users = {
          id: i.id,
          name: i.name,
          avatar: i.avatar,
        };

        if (userid === root) {
          obj.online = i.online;
        }

        return obj;
      });

    console.log(
      'data',
      data.map((user) => ({ ...user, avatar: user.avatar.slice(0, 20) })),
    );

    return { errcode: 0, data };
  }

  // 添加好友
  async addFriend(selfUserId: string, targetUserName: string) {
    // console.log(
    //   'this.user_friends',
    //   JSON.stringify(this.user_friends, null, 4),
    // );

    const table_user = this.usersService.getTableUser();

    const targetUser = table_user.find((i) => i.name === targetUserName);

    const defaultData = [];

    if (!targetUser) {
      return { errcode: 403, message: '该用户不存在', data: defaultData };
    }

    const targetUserId = targetUser.id;
    if (selfUserId === targetUserId) {
      return { errcode: 403, message: '不能添加自己为好友', data: defaultData };
    }

    const selfUser = await this.usersService.findOne(selfUserId);
    if (selfUser.friends.includes(targetUserId)) {
      return {
        errcode: 403,
        message: '已经是好友不能重复添加',
        data: defaultData,
      };
    } else {
      // 开始添加，互加
      selfUser.friends.push(targetUserId);
      targetUser.friends.push(selfUserId);
      return { errcode: 0, message: '成功', data: defaultData };
    }
  }

  // 创建群聊
  async createGroup(data: createGroupParams) {
    const { userid, name, members } = data;

    const groupId = v4();

    const groupData = await this.usersService.addGroup({
      id: groupId,
      name,
      avatar: genBase64ImageByName(name),
      owner: userid,
      member: members,
    });

    await this.usersService.userJoinGroup([userid], groupId);

    return groupData;
  }

  // 为群聊添加成员
  async addGroupMember(data: AddGroupMember.params) {
    const { userIds, groupId } = data;

    const res = await this.usersService.userJoinGroup(userIds, groupId);

    return res;
  }
}
