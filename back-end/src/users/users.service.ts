import { Injectable } from '@nestjs/common';
import { root } from 'src/interface';
import { loadData } from 'src/utils';

// This should be a real class/interface representing a user entity
export interface User {
  id: string;
  name: string;
  friends: string[];
  online: 1 | 0;
  //  createAt: 1687939161229,
  //  updateAt: 1687939161229,
}

// 临时方案
const historyData = loadData() || {};
const table_user: User[] = historyData.table_user || [
  {
    id: root,
    name: 'zzb',
    friends: [],
    online: 1,
  },
];

@Injectable()
export class UsersService {
  // 用户表
  private table_user: User[] = table_user;

  async findOne(userid: string): Promise<User | undefined> {
    return this.table_user.find((user) => user.id === userid);
  }

  getTableUser(): User[] {
    return this.table_user;
  }

  async add(item: User): Promise<User> {
    this.table_user.push(item);
    return this.table_user.find((i) => i.id === item.id);
  }

  async update(id: string, update: Partial<User>): Promise<boolean> {
    const user = this.table_user.find((item) => item.id === id);
    if (!user) return false;

    for (const key in update) {
      user[key] = update[key];
    }

    return true;
  }
}
