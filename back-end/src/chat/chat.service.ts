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
  // map_message_Type,
} from 'src/interface';
import { UsersService } from 'src/users/users.service';
import { genBase64ImageByName, getChatKey, loadData } from 'src/utils';
import { GetMessageList } from './interface';
import { User } from 'src/users/interface';

// 临时方案
const historyData = loadData() || {};
// 聊天记录表 map 形式
const map_chat: map_chat_Type = historyData.map_chat || {};
// 消息列表 map 形式
// const map_message: map_message_Type = historyData.map_message || {};
// const map_message = {
//   ["userId"]: {
//     ["person1Id"]: { count: 0, lastMsg: "", time: 0, avatar: '' },
//     ["person2Id"]: { count: 3, lastMsg: "第三方", time: 0, avatar: '' },
//     ["group1Id"]: { count: 10, lastMsg: "地方", time: 0, avatar: '' },
//     ["group2Id"]: { count: 1, lastMsg: "..", time: 0, avatar: '' },
//   },
// };

@Injectable()
export class ChatService {
  // 聊天 map
  private map_chat: map_chat_Type = map_chat;

  constructor(private usersService: UsersService) {}

  getMapChat() {
    return this.map_chat;
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

  async getMessageList(
    params: GetMessageList.params,
  ): Promise<GetMessageList.resData> {
    const { id } = params;

    // 个人
    const user_friends = this._getUserFriends();
    const table_user = this.usersService.getTableUser();
    const personData = table_user
      .filter((item) => (user_friends[id] || []).includes(item.id))
      .map((i) => ({ id: i.id, name: i.name, avatar: i.avatar, isGroup: 0 }));

    // 群
    const tableGroup = this.usersService.getTableGroup();
    const groupData = tableGroup
      .filter((group) => group.member.includes(id))
      .map((group) => ({ ...group, isGroup: 1 }));

    const data = [...personData, ...groupData];

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
  postMessage(params: sendMessageParams): null {
    const { to, form, addData, isGroup } = params;

    const key = getChatKey(to, form, isGroup);

    if (this.map_chat[key]) {
      this.map_chat[key].push(...addData);
    } else {
      this.map_chat[key] = addData;
    }

    return null;
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
