import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { v4 } from 'uuid';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { root } from 'src/interface';
import { genBase64ImageByName, loadData } from 'src/utils';
import { OnlineStatus, User, UserTable } from './users.entity';
import { Group } from './interface';
import { ChatService } from 'src/chat/chat.service';

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
    private repo: Repository<UserTable>,
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService,
  ) {}

  // change name to findOneByUuid
  async findOne(uuid: string): Promise<User | undefined> {
    return this.repo.findOne({ where: { uuid } });
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

  // 获取用户好友映射 map
  getUserFriends(table_user: User[]) {
    return table_user.reduce((r, i) => {
      r[i.uuid] = i.friends;
      return r;
    }, {});
  }

  // 获取最新的在线用户 id
  async getOnlineUserIds(): Promise<string[]> {
    // return this.table_user.filter((i) => i.online === 1).map((i) => i.id);
    const onlineData = await this.repo.find({
      where: { online: OnlineStatus.ONLINE },
    });
    return onlineData.map((i) => i.uuid);
  }

  // 新建用户
  async add(item: Omit<User, 'id'>): Promise<User> {
    // const res = await this.repo.save(item);
    const userData = this.repo.create(item);
    // console.log('add userData ', userData);

    await this.repo.save(userData);

    return userData;
  }

  // 更新用户
  async update(
    uuid: string,
    update: Partial<Omit<User, 'id' | 'uuid'>>,
  ): Promise<boolean> {
    // const user = this.table_user.find((item) => item.uuid === uuid);
    const user = await this.findOne(uuid);
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

    const table_user = await this.getTableUser();

    const user_friends = this.getUserFriends(table_user);
    // console.log('userid', userid);
    // console.log('user_friends', user_friends);

    // TODO 整体逻辑优化，直接从数据库中按条件查，而不是返回全部的再找
    const data = table_user
      .filter((item) => (user_friends[userid] || []).includes(item.uuid))
      .map((i) => {
        const obj: API_USER.GetUserList['Users'] = {
          id: i.uuid,
          name: i.name,
          avatar: i.avatar,
        };

        if (userid === root) {
          obj.online = i.online;
        }

        return obj;
      });

    console.log(
      'getUserList data',
      data.map((user) => ({ ...user, avatar: user.avatar.slice(0, 20) })),
    );

    return data;
  }

  // TODO 好友关系表
  // 添加好友
  async addFriend(selfUserId: string, targetUserName: string) {
    // console.log(
    //   'this.user_friends',
    //   JSON.stringify(this.user_friends, null, 4),
    // );

    const targetUser = await this.repo.findOne({
      where: { name: targetUserName },
    });

    const defaultData = [];

    if (!targetUser) {
      return { errcode: 403, message: '该用户不存在', data: defaultData };
    }

    const targetUserId = targetUser.uuid;
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
      // 开始添加，互加好友
      selfUser.friends.push(targetUserId);
      await this.repo.save(selfUser);
      targetUser.friends.push(selfUserId);
      await this.repo.save(targetUser);

      // 互相生成初始化消息
      await this.chatService.initUserMessage(selfUserId, targetUserId);
      await this.chatService.initUserMessage(targetUserId, selfUserId);

      return { errcode: 0, message: '成功', data: defaultData };
    }
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
    const table_user = await this.getTableUser();
    const users = table_user.filter((user) => userIds.includes(user.uuid));
    const group = await this.findOneGroup(groupId);
    if (!users.length || !group) return false;

    users.forEach((user) => {
      // 用户表里添加
      if (!user.friends.includes(groupId)) {
        user.friends.push(groupId);
      }
      // 群表里添加
      if (!group.member.includes(user.uuid)) {
        group.member.push(user.uuid);
      }
      // 消息表 为该用户初始化这个群的消息记录
      this.chatService.initUserMessage(user.uuid, groupId);
    });

    return true;
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
      const user = table_user.find((u) => u.uuid === userId);
      return { name: user.name, id: user.uuid, avatar: user.avatar };
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
