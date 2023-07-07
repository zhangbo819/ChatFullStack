import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { createGroupParams, root } from 'src/interface';
import { genBase64ImageByName, loadData } from 'src/utils';
import { Group, User } from './interface';

// This should be a real class/interface representing a user entity

// 临时方案
const historyData = loadData() || {};
const table_user: User[] = historyData.table_user || [
  {
    id: root,
    name: 'zzb',
    friends: [],
    groups: [],
    online: 1,
    avatar: '',
  },
];
const table_group: Group[] = historyData.table_group || [];

@Injectable()
export class UsersService {
  // 用户表
  private table_user: User[] = table_user;
  // 群聊表 暂时放这
  private table_group: Group[] = table_group;

  // TODO 后期拆到 auth 模块
  // 检查用户是否登录
  checkLogin(headers: Record<string, any>) {
    let errcode = 0;
    let message = '';
    const authorization = decodeURIComponent(
      headers.Authorization || headers.authorization || '',
    );

    const user_ids = this.table_user
      .filter((i) => i.online === 1)
      .map((i) => i.id);
    // console.log('checkLogin user_ids', user_ids);
    if (!authorization || !user_ids.includes(authorization)) {
      errcode = 401;
      message = '用户未登录';
    }
    return { errcode, message, data: [] };
  }

  async findOne(userid: string): Promise<User | undefined> {
    return this.table_user.find((user) => user.id === userid);
  }

  // 获取用户表
  getTableUser(): User[] {
    return this.table_user;
  }

  // 获取用户好友映射 map
  getUserFriends() {
    return this.table_user.reduce((r, i) => {
      r[i.id] = i.friends;
      return r;
    }, {});
  }

  // 获取最新的在线用户 id，方便后期改成数据库的形式
  getOnlineUserIds() {
    return this.table_user.filter((i) => i.online === 1).map((i) => i.id);
  }

  // 新建用户
  async add(item: User): Promise<User> {
    this.table_user.push(item);
    return this.table_user.find((i) => i.id === item.id);
  }

  // 更新用户
  async update(id: string, update: Partial<User>): Promise<boolean> {
    const user = this.table_user.find((item) => item.id === id);
    if (!user) return false;

    for (const key in update) {
      user[key] = update[key];
    }

    return true;
  }

  // 获取用户列表
  getUserList(headers, Query: API_USER.GetUserList['params']) {
    // console.log('headers, Query', headers, Query);
    const err = this.checkLogin(headers);
    if (err.errcode !== 0) return { ...err, data: [] };

    // console.log('this.users', this.users);

    const { userid } = Query;

    const user_friends = this.getUserFriends();

    const table_user = this.getTableUser();

    const data = table_user
      .filter((item) => (user_friends[userid] || []).includes(item.id))
      .map((i) => {
        const obj: API_USER.GetUserList['Users'] = {
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

    const targetUser = this.table_user.find((i) => i.name === targetUserName);

    const defaultData = [];

    if (!targetUser) {
      return { errcode: 403, message: '该用户不存在', data: defaultData };
    }

    const targetUserId = targetUser.id;
    if (selfUserId === targetUserId) {
      return { errcode: 403, message: '不能添加自己为好友', data: defaultData };
    }

    const selfUser = await this.findOne(selfUserId);
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

  // 群聊 暂时放这
  // 获取群聊表
  getTableGroup(): Group[] {
    return this.table_group;
  }

  // 按 id 查找群
  async findOneGroup(groupId: string) {
    return this.table_group.find((group) => group.id === groupId);
  }

  // 创建群聊
  async createGroup(data: createGroupParams) {
    const { userid, name, members } = data;

    const groupId = v4();

    const newGroup = {
      id: groupId,
      name,
      avatar: genBase64ImageByName(name),
      owner: userid,
      member: members,
    };

    this.table_group.push(newGroup);

    await this._userJoinGroup([userid], groupId);

    return newGroup;
  }

  // 为群聊添加成员
  async addGroupMember(data: API_USER.AddGroupMember['params']) {
    const { userIds, groupId } = data;

    const res = await this._userJoinGroup(userIds, groupId);

    return res;
  }

  // 用户加入群聊
  private async _userJoinGroup(userIds: string[], groupId: string) {
    const users = this.table_user.filter((user) => userIds.includes(user.id));
    const group = await this.findOneGroup(groupId);
    if (!users.length || !group) return false;

    users.forEach((user) => {
      if (!user.friends.includes(groupId)) {
        user.friends.push(groupId);
      }
      if (!group.member.includes(user.id)) {
        group.member.push(user.id);
      }
    });

    return true;
  }

  // 获取指定 id 的群信息
  async getGroupInfoById(
    groupId: string,
  ): Promise<API_USER.GetGroupInfoById['res']> {
    const group = this.table_group.find((g) => g.id === groupId);

    if (!group) return { errcode: 501, data: {} as any, message: '群不存在' };

    const memberList = group.member.map((userId) => {
      const user = this.table_user.find((u) => u.id === userId);
      return { name: user.name, id: user.id, avatar: user.avatar };
    });

    return {
      errcode: 0,
      data: {
        name: group.name,
        id: group.id,
        owner: group.owner,
        memberList,
      },
      message: '成功',
    };
  }
}
