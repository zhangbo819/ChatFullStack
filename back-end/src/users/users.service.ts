import { Injectable } from '@nestjs/common';
import { root } from 'src/interface';
import { loadData } from 'src/utils';
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
  },
];
const table_group: Group[] = historyData.table_group || [];

@Injectable()
export class UsersService {
  // 用户表
  private table_user: User[] = table_user;
  // 群聊表 暂时放这
  private table_group: Group[] = table_group;

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
}
