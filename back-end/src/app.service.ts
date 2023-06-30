import { Injectable } from '@nestjs/common';
import { CronJob } from 'cron';
import { v4 } from 'uuid';
import {
  DataType,
  getChatListParams,
  root,
  sendMessageParams,
  RootCode,
  table_user_item,
  map_chat_Type,
} from './interface';
import { getChatKey, loadData, saveData } from './utils';

@Injectable()
export class AppService {
  // 用户表
  private table_user: table_user_item[] = [
    {
      id: root,
      name: 'zzb',
      friends: [],
      online: 1,
    },
  ];
  // 聊天记录的 map
  private map_chat: map_chat_Type = {};

  constructor() {
    // 临时方案
    // 读取数据
    this.loadVolumeData();

    // 每个整点 保存一次数据
    new CronJob(
      '0 * * * *',
      () => {
        console.log('CronJob in');
        this.saveVolumeData();
      },
      null,
      true,
    );
  }

  // 读取历史数据
  private loadVolumeData() {
    const historyData = loadData();
    console.log('读取历史数据 ', historyData);
    if (historyData) {
      const table_user: table_user_item[] = historyData.table_user;
      const map_chat: map_chat_Type = historyData.map_chat;

      if (table_user) {
        this.table_user = table_user;
      }
      if (map_chat) {
        this.map_chat = map_chat;
      }
    }
  }

  // 保存数据进 volume
  private saveVolumeData() {
    console.log('保存数据进 volume');
    const table_user = this.table_user;
    const map_chat = this.map_chat;

    console.log(JSON.stringify(table_user, null, 4));
    console.log(JSON.stringify(map_chat, null, 4));

    const data = {
      time: Date.now(),
      table_user,
      map_chat,
    };
    saveData(JSON.stringify(data));
  }

  // 获取最新的在线用户 id，方便后期改成数据库的形式
  private _getOnlineUserIds() {
    return this.table_user.filter((i) => i.online === 1).map((i) => i.id);
  }

  // 获取用户好友映射 map
  private _getUserFriends() {
    return this.table_user.reduce((r, i) => {
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
  userLogin(data: { userName: string; rootCode?: string }) {
    const { userName } = data;
    const rootUserName = this.table_user.find((i) => i.id === root)?.name;
    if (userName === rootUserName) {
      // root
      if (data.rootCode !== RootCode) {
        return { errcode: 402, message: 'root 用户不可登录' };
      } else {
        return { errcode: 0, message: '成功', data: { id: root, name: 'zzb' } };
      }
    }

    let userData = this.table_user.find((i) => i.name === userName);

    if (userData && userData.online === 1) {
      return { errcode: 402, message: '用户已登录' };
    }

    if (!userData) {
      const id = v4(userName);
      userData = {
        id,
        name: userName,
        friends: [root],
        online: 1,
      };
      this.table_user.push(userData);
      const rootUser = this.table_user.find((i) => i.id === root);
      rootUser.friends.push(id);
    }

    userData.online = 1;

    console.log('登录成功', userData);

    return {
      errcode: 0,
      message: '成功',
      data: { id: userData.id, name: userData.name },
    };
  }

  // 退出登录
  loginOut(userid: string) {
    // this.users = this.users.filter((i) => i !== userid || i === root);
    const target_user = this.table_user.find((i) => i.id === userid);
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

    const data = this.table_user
      .filter((item) => (user_friends[userid] || []).includes(item.id))
      .map((i) => ({ id: i.id, name: i.name }));

    console.log('data', data);

    return { errcode: 0, data };
  }

  // 添加好友
  addFriend(selfUserId: string, targetUserName: string) {
    // console.log(
    //   'this.user_friends',
    //   JSON.stringify(this.user_friends, null, 4),
    // );

    const targetUser = this.table_user.find((i) => i.name === targetUserName);

    if (!targetUser) {
      return { errcode: 403, message: '该用户不存在' };
    }

    const targetUserId = targetUser.id;
    if (selfUserId === targetUserId) {
      return { errcode: 403, message: '不能添加自己为好友' };
    }

    const selfUser = this.table_user.find((item) => item.id === targetUserId);
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

// const table_user = [
//   {
//     id: 'root',
//     name: 'zzb',
//     friends: ['a', 'b', 'c'],
//     group: ['g1', 'g2'],
//     online: 1,
// //  createAt: 1687939161229,
// //  updateAt: 1687939161229,
//   },
// ];
// const users = []         // 在线
// const user_friends = {
//   zzb: ['a', 'b', 'c'],
// };

// const map_chat = {
//   'id>id': [
//     {
//       time: 1687939161229,
//       form: 'zzb_id',
//       msg: '啦啦啦',
//     },
//   ],
// };

//
// 群 下版
// const table_group = [
//   {
//     id: 'ddds',
//     name: '3人群',
//     member: ['zzb', 'a', 'b'],
//   },
// ];
