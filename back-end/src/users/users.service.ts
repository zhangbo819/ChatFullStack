import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, ILike, Repository } from 'typeorm';

import { loadData } from 'src/utils';
import { FriendshipsService } from 'src/friendships/friendships.service';
import { ChatService } from 'src/chat/chat.service';
import { OnlineStatus, User, UserTable } from './users.entity';
import { Group } from './interface';

// This should be a real class/interface representing a user entity

// 临时方案
const historyData = loadData() || {};
const histroy_table_group: Group[] = historyData.table_group || [];

@Injectable()
export class UsersService {
  // 群聊表 暂时放这
  private table_group: Group[] = histroy_table_group;

  constructor(
    @InjectRepository(UserTable)
    private readonly repo: Repository<UserTable>,
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService,
    @Inject(forwardRef(() => FriendshipsService))
    private friendshipsService: FriendshipsService,
  ) {}

  findOne(options: FindOneOptions<UserTable>): Promise<User> {
    return this.repo.findOne(options);
  }

  findOneById(id: string): Promise<User> {
    return this.repo.findOne({ where: { id } });
  }

  // 获取用户表
  async getTableUser(): Promise<User[]> {
    const data = await this.repo.find();
    // console.log(
    //   'table data',
    //   data.map((i) => ({ ...i, avatar: i.avatar.slice(0, 10) })),
    // );
    return data;
  }

  // 获取最新的在线用户 id
  async getOnlineUserIds(): Promise<string[]> {
    // return this.table_user.filter((i) => i.online === 1).map((i) => i.id);
    const onlineData = await this.repo.find({
      where: { online: OnlineStatus.ONLINE },
    });
    return onlineData.map((i) => i.id);
  }

  // 新建用户
  // TODO type
  async add(item: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    // const res = await this.repo.save(item);
    const userData = this.repo.create(item);
    // console.log('add userData ', userData);

    await this.repo.save(userData);

    return userData;
  }

  // 更新用户
  async update(
    id: string,
    update: Partial<Omit<User, 'id'>>,
  ): Promise<boolean> {
    // const user = this.table_user.find((item) => item.id === id);
    const user = await this.findOneById(id);
    if (!user) return false;

    for (const key in update) {
      user[key] = update[key];
    }
    await this.repo.save(user);

    return true;
  }

  // 获取用户列表
  async getUserList(Query: API_USER.GetUserList['params']) {
    // console.log('headers, Query', headers, Query);
    // console.log('this.users', this.users);

    const { userid } = Query;

    // const table_user = await this.getTableUser();

    // 用户列表
    const userList = await this.friendshipsService.getFriends(userid);
    // TODO 群列表

    // // TODO getUserFriends remove
    // const user_friends = this.friendshipsService.getUserFriends(table_user);
    // // console.log('userid', userid);
    // // console.log('user_friends', user_friends);

    // // TODO 整体逻辑优化，直接从数据库中按条件查，而不是返回全部的再找
    // const data = table_user
    //   .filter((item) => (user_friends[userid] || []).includes(item.id))
    //   .map((i) => {
    //     const obj: API_USER.GetUserList['Users'] = {
    //       id: i.id,
    //       name: i.name,
    //       avatar: i.avatar,
    //     };

    //     if (userid === root) {
    //       obj.online = i.online;
    //     }

    //     return obj;
    //   });

    const data = userList.map((f) => ({
      id: f.requester.id,
      cid: f.conversationId,
      name: f.requester.name,
      avatar: f.requester.avatar,
    }));

    console.log(
      'getUserList data',
      data.map((user) => ({ ...user, avatar: user.avatar.slice(0, 20) })),
    );

    return data;
  }

  // 根据用户名查询用户
  searchUserByName(name: string) {
    return this.repo.find({
      where: {
        name: ILike(`%${name}%`),
      },
      take: 20, // 限制返回数量
    });
  }

  // 更换头像
  async changeAvatar(userid: string, url: string) {
    const user = await this.findOneById(userid);
    console.log(user, url.slice(0, 30));
    if (!user || !url) return false;
    user.avatar = url;
    return true;
  }
}
