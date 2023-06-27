import { Injectable } from '@nestjs/common';
import {
  DataType,
  getChatListParams,
  // local,
  // remote,
  root,
  sendMessageParams,
  RootCode,
} from './interface';
import { loadData, saveData } from './utils';

@Injectable()
export class AppService {
  // { time: 1686799994400, msg: 'hello local', form: remote },
  // { time: 1686799984400, msg: 'hello remote', form: local },
  private readonly data = {
    [root]: {},
  };

  private users = [root];

  private user_friends = {
    [root]: this.users,
  };

  constructor() {
    // 临时方案
    // 读取历史数据
    const historyData = loadData();
    console.log('historyData', historyData);
    if (historyData) {
      const { users, user_friends, data } = historyData;
      if (users) {
        this.users = users;
      }
      if (user_friends) {
        this.user_friends = user_friends;
      }
      if (data) {
        this.data = data;
      }
    }

    // 每 1小时 保存一次数据
    setInterval(() => {
      console.log('saveData interval in');
      const data = {
        time: Date.now(),
        users: this.users,
        user_friends: this.user_friends,
        data: this.data,
      };
      saveData(JSON.stringify(data));
    }, 60 * 60 * 1000);
  }

  // 检查用户是否登录
  checkLogin(headers: Record<string, any>) {
    let errcode = 0;
    let message = '';
    const authorization = decodeURIComponent(
      headers.Authorization || headers.authorization || '',
    );
    if (!authorization || !this.users.includes(authorization)) {
      errcode = 401;
      message = '用户未登录';
    }
    return { errcode, message };
  }

  // 登录
  userLogin(data: { userid: string; rootCode?: string }) {
    if (data.userid === root) {
      // root
      if (data.rootCode !== RootCode) {
        return { errcode: 402, message: 'root 用户不可登录' };
      } else {
        return { errcode: 0, message: '成功' };
      }
    }

    if (this.users.includes(data.userid)) {
      return { errcode: 402, message: '用户已登录' };
    }

    this.users.push(data.userid);
    if (!this.user_friends[data.userid]) {
      this.user_friends[data.userid] = [root];
    }

    return { errcode: 0, message: '成功' };
  }

  // 退出登录
  loginOut(userid: string) {
    this.users = this.users.filter((i) => i !== userid || i === root);

    return { errcode: 0, message: '成功' };
  }

  // 获取消息列表
  getList(params: getChatListParams): DataType[] {
    const { to, form, time } = params;
    // console.log('to, form', to, form);
    console.log('this.data', JSON.stringify(this.data, null, 4));
    return this.data[form]?.[to] || [];
  }

  private saveChat(form: string, to: string, data: any): void {
    if (typeof this.data[form] == 'undefined') {
      this.data[form] = { [to]: [] };
    }

    if (!Array.isArray(this.data[form][to])) {
      this.data[form][to] = [];
    }

    this.data[form][to].push(...data);
  }

  // 发送消息
  postMessage(params: sendMessageParams): null {
    const { to, form, addData } = params;

    this.saveChat(to, form, addData);
    this.saveChat(form, to, addData);

    return null;
  }

  // 获取用户列表
  getUserList(headers, Query) {
    const err = this.checkLogin(headers);
    if (err.errcode !== 0) return { ...err, data: [] };

    console.log('this.users', this.users);

    const { userid } = Query;

    const data = this.user_friends[userid] || [root];

    return { errcode: 0, data };
  }

  // 添加好友
  addFriend(user: string, target: string) {
    console.log(
      'this.user_friends',
      JSON.stringify(this.user_friends, null, 4),
    );
    if (!Array.isArray(this.user_friends[target])) {
      return { errcode: 403, message: '用户不存在' };
    }
    if (!Array.isArray(this.user_friends[user])) {
      return { errcode: 401, message: '好友列表错误，请重新登录' };
    }

    if (!this.user_friends[user].includes(target)) {
      this.user_friends[user].push(target);

      if (!this.user_friends[target].includes(user)) {
        this.user_friends[target].push(user);
      }
      return { errcode: 0, message: '成功' };
    } else {
      return { errcode: 403, message: '已经是好友不能重复添加' };
    }
  }
}

// const map = {
//   'zzb-zh': [
//     { time: 0, msg: 'hello zzb', from: 'zh' },
//     { time: 1, msg: 'hello zh', from: 'zzb' },
//   ],
//   'zzb-ddd': [],
//   'ddd-zh': [],
// };

// const da = {
//   zzb: {
//     zh: map['zzb-zh'],
//     dd: [],
//   },
//   zh: {
//     zzb: map['zh-zzb'],
//     dd: [],
//   },
//   ddd: {
//     zzb: [],
//     zh: [],
//   },
// };

// console.log(da);
