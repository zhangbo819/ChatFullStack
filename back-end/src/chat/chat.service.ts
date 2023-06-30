import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import {
  DataType,
  RootCode,
  getChatListParams,
  map_chat_Type,
  root,
  sendMessageParams,
} from 'src/interface';
import { UsersService } from 'src/users/users.service';
import { getChatKey, loadData } from 'src/utils';

// 临时方案
const historyData = loadData() || {};
const map_chat: map_chat_Type = historyData.map_chat || {};

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
    return { errcode, message };
  }

  // 登录
  async userLogin(data: { userName: string; rootCode?: string }) {
    const { userName } = data;

    const table_user = this.usersService.getTableUser();

    const rootUser = await this.usersService.findOne(root);
    if (userName === rootUser.name) {
      // root
      if (data.rootCode !== RootCode) {
        return { errcode: 402, message: 'root 用户不可登录' };
      } else {
        return { errcode: 0, message: '成功', data: { id: root, name: 'zzb' } };
      }
    }

    let userData = table_user.find((i) => i.name === userName);

    if (userData && userData.online === 1) {
      return { errcode: 402, message: '用户已登录' };
    }

    if (!userData) {
      const id = v4(userName);
      //   this.table_user.push(userData);
      userData = await this.usersService.add({
        id,
        name: userName,
        friends: [root],
        online: 1,
      });
      const rootUser = await this.usersService.findOne(root);
      rootUser.friends.push(id);
    } else {
      await this.usersService.update(userData.id, { online: 1 });
    }

    console.log('登录成功', userData);

    return {
      errcode: 0,
      message: '成功',
      data: { id: userData.id, name: userData.name },
    };
  }

  // 退出登录
  async loginOut(userid: string) {
    // this.users = this.users.filter((i) => i !== userid || i === root);
    const target_user = await this.usersService.findOne(userid);
    if (!target_user) {
      return { errcode: 401, mesaage: '用户不存在，请重新登录' };
    }

    if (userid !== root) {
      target_user.online = 0;
    }

    return { errcode: 0, message: '成功' };
  }

  // 获取聊天记录列表
  getList(params: getChatListParams): DataType[] {
    const { to, form } = params;
    console.log('获取聊天记录列表');
    // console.log('to, form', to, form);
    // console.log('this.data', JSON.stringify(this.data, null, 4));

    const key = getChatKey(to, form);

    console.log(this.map_chat[key]);

    return this.map_chat[key] || [];
  }

  // 发送消息
  postMessage(params: sendMessageParams): null {
    const { to, form, addData } = params;

    const key = getChatKey(to, form);

    if (this.map_chat[key]) {
      this.map_chat[key].push(...addData);
    } else {
      this.map_chat[key] = addData;
    }

    return null;
  }

  // 获取用户列表
  getUserList(headers, Query) {
    // console.log('headers, Query', headers, Query);
    const err = this.checkLogin(headers);
    if (err.errcode !== 0) return { ...err, data: [] };

    // console.log('this.users', this.users);

    const { userid } = Query;

    const user_friends = this._getUserFriends();

    const table_user = this.usersService.getTableUser();

    const data = table_user
      .filter((item) => (user_friends[userid] || []).includes(item.id))
      .map((i) => ({ id: i.id, name: i.name }));

    console.log('data', data);

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

    if (!targetUser) {
      return { errcode: 403, message: '该用户不存在' };
    }

    const targetUserId = targetUser.id;
    if (selfUserId === targetUserId) {
      return { errcode: 403, message: '不能添加自己为好友' };
    }

    const selfUser = await this.usersService.findOne(targetUserId);
    if (selfUser.friends.includes(targetUserId)) {
      return { errcode: 403, message: '已经是好友不能重复添加' };
    } else {
      // 开始添加，互加
      selfUser.friends.push(targetUserId);
      targetUser.friends.push(selfUserId);
      return { errcode: 0, message: '成功' };
    }
  }
}
