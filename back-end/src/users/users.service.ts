import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { root } from 'src/interface';
import { genBase64ImageByName, loadData } from 'src/utils';
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

  async find() {
    return this.repo.find({ where: {} });
  }

  // TODO spreading parameter
  async findOne(id: string): Promise<User | undefined> {
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
    const user = await this.findOne(id);
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
    const user = await this.findOne(userid);
    console.log(user, url.slice(0, 30));
    if (!user || !url) return false;
    user.avatar = url;
    return true;
  }

  // TODO 群聊逻辑整体梳理
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
  async createGroup(data: API_USER.createGroup['params']) {
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

    await this._userJoinGroup(members, groupId);

    return newGroup;
  }

  // 为群聊添加成员
  async addGroupMember(data: API_USER.AddGroupMember['params']) {
    const { userIds, groupId } = data;

    const res = await this._userJoinGroup(userIds, groupId);

    return res;
  }

  // TODO 更新表，群聊逻辑整体梳理
  // 用户加入群聊
  private async _userJoinGroup(userIds: string[], groupId: string) {
    return false;

    // const table_user = await this.getTableUser();
    // const users = table_user.filter((user) => userIds.includes(user.id));
    // const group = await this.findOneGroup(groupId);
    // if (!users.length || !group) return false;

    // users.forEach((user) => {
    //   // 用户表里添加
    //   if (!user.friends.includes(groupId)) {
    //     user.friends.push(groupId);
    //   }
    //   // 群表里添加
    //   if (!group.member.includes(user.id)) {
    //     group.member.push(user.id);
    //   }
    //   // 消息表 为该用户初始化这个群的消息记录
    //   this.chatService.initUserMessage(user.id, groupId);
    // });

    // return true;
  }

  // TODO 群聊逻辑整体梳理
  // 获取指定 id 的群信息
  async getGroupInfoById(
    groupId: string,
  ): Promise<API_USER.GetGroupInfoById['res']> {
    const group = this.table_group.find((g) => g.id === groupId);

    if (!group) return { errcode: 501, data: {} as any, message: '群不存在' };

    const table_user = await this.getTableUser();

    const memberList = group.member.map((userId) => {
      const user = table_user.find((u) => u.id === userId);
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
