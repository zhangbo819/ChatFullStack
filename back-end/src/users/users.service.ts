import { Injectable } from '@nestjs/common';
import { root } from 'src/interface';
import { loadData } from 'src/utils';
import { GetGroupInfoById, Group, User } from './interface';

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

  // 群聊 暂时放这
  // 获取群聊表
  getTableGroup(): Group[] {
    return this.table_group;
  }

  // 按 id 查找群
  async findOneGroup(groupId: string) {
    return this.table_group.find((group) => group.id === groupId);
  }

  // 新建群聊
  async addGroup(item: Group): Promise<Group> {
    this.table_group.push(item);
    return this.table_group.find((i) => i.id === item.id);
  }

  // 用户加入群聊
  async userJoinGroup(userIds: string[], groupId: string) {
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

  // 获取指定 id 的用户信息
  async getGroupInfoById(groupId: string): Promise<GetGroupInfoById.res> {
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
