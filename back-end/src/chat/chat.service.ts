import { DataSource, Repository } from 'typeorm';
import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UsersService } from 'src/users/users.service';
import {
  ConversationTable,
  ConversationType,
} from './entities/conversation.entity';
import { ConversationMemberTable } from './entities/conversation-member.entity';
import { MessageTable } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    private dataSource: DataSource,

    @InjectRepository(ConversationTable)
    private readonly conversationRepo: Repository<ConversationTable>,

    @InjectRepository(ConversationMemberTable)
    private readonly conversationMemberRepo: Repository<ConversationMemberTable>,

    @InjectRepository(MessageTable)
    private readonly messageRepo: Repository<MessageTable>,

    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  // 创建私聊会话
  async createPrivateConversation(
    userIdA: string,
    userIdB: string,
  ): Promise<ConversationTable> {
    const [u1, u2] = [userIdA, userIdB].sort();
    const privateKey = u1 + '_' + u2;

    // TODO 事务
    // 创建私聊会话
    const conversation = this.conversationRepo.create({
      type: ConversationType.PRIVATE,
      privateKey,
      memberCount: 2, // 私聊必定是两个人，用处不大
    });
    await this.conversationRepo.save(conversation);

    // 把私聊用户添加到会话成员表
    const user1 = await this.usersService.findOne(u1);
    const conversationMember1 = this.conversationMemberRepo.create({
      conversation,
      user: user1,
    });
    await this.conversationMemberRepo.save(conversationMember1);
    const user2 = await this.usersService.findOne(u2);
    const conversationMember2 = this.conversationMemberRepo.create({
      conversation,
      user: user2,
    });
    await this.conversationMemberRepo.save(conversationMember2);

    return conversation;
  }

  // 获取消息列表
  async getMessageList(
    params: API_CHAT.GetMessageList['params'],
  ): Promise<API_CHAT.GetMessageList['resData']> {
    const { id: userId } = params;

    // v3, count lastMsg time
    const data = await this.conversationMemberRepo
      .createQueryBuilder('cm1')
      .innerJoin('cm1.conversation', 'c')

      // 找到同会话的其他成员（用于私聊）
      .leftJoin(
        ConversationMemberTable,
        'cm2',
        'cm1.conversation_id = cm2.conversation_id AND cm2.user_id != cm1.user_id',
      )
      .leftJoin('cm2.user', 'u')
      // 加入最后一条消息
      .leftJoin('c.lastMessage', 'm')

      .where('cm1.user_id = :userId', { userId })

      .select([
        'c.id AS id',
        `CASE 
        WHEN c.type = 'group' THEN c.name
        ELSE u.name
      END AS name`,
        `CASE 
        WHEN c.type = 'group' THEN c.avatar
        ELSE u.avatar
      END AS avatar`,
        // 最后一条消息内容
        'm.content AS "lastMsg"',

        // 最后一条消息时间（排序用）
        '(EXTRACT(EPOCH FROM m.createdAt) * 1000)::bigint AS "time"', // 换成时间戳

        'cm1.unread_count AS "count"',
      ])
      // 按最后消息排序
      .orderBy('m.createdAt', 'DESC')

      .getRawMany();

    // console.log('data', data);

    const ResData: API_CHAT.GetMessageList['resItem'][] = [...data];

    return ResData;
  }

  // 根据会话id获取会话成员信息
  async getConversationMemberInfos(
    params: API_CHAT.GetConversationMemberInfos['params'],
  ): Promise<API_CHAT.GetConversationMemberInfos['resData']> {
    const { id } = params;

    const [conversation, members] = await Promise.all([
      this.conversationRepo.findOneBy({ id }),
      this.conversationMemberRepo.find({
        where: { conversation: { id } },
        relations: { user: true },
      }),
    ]);

    return {
      isGroup: conversation.type === ConversationType.GROUP,
      data: members.map((m) => ({
        id: m.user.id,
        name: m.nickname || m.user.name,
        avatar: m.user.avatar,
      })),
    };
  }

  // 获取聊天记录列表
  async getChatList(
    params: API_CHAT.getChatList['params'],
  ): Promise<API_CHAT.DataType[]> {
    const { cid } = params;
    // console.log('获取聊天记录列表');

    if (!cid) {
      throw new BadRequestException('cid 不能为空');
    }

    // TODO 验证自己在这个会话里
    const messages = await this.messageRepo.find({
      where: { conversation: { id: cid } },
      relations: { sender: true },
      order: { createdAt: 'DESC' },
      // take: 100, // 最近100条
      // skip: 0, // 分页
    });

    const data = messages.reverse().map((i) => ({
      time: i.createdAt.getTime(),
      msg: i.content,
      form: i.sender.id,
    }));

    return data;
  }

  // 发送消息
  async sendMessage(
    params: API_CHAT.sendMessage['params'],
  ): Promise<MessageTable> {
    const { cid, uid, content } = params;

    // 消息表的新建消息 和 会话表的保存最后一条信息 放到事务中，确保同步完成
    return this.dataSource.transaction(async (manager) => {
      // 1. 创建消息
      const message = manager.create(MessageTable, {
        conversation: { id: cid },
        sender: { id: uid },
        content,
      });
      await manager.save(message);

      // 2. 更新会话最后一条消息
      await manager.update(
        ConversationTable,
        { id: cid },
        { lastMessage: message, updatedAt: message.createdAt },
      );

      // 3. 给会话中其他成员未读数 +1
      await manager
        .createQueryBuilder()
        .update(ConversationMemberTable)
        .set({
          unread_count: () => 'unread_count + 1', // 自增
          updatedAt: () => 'NOW()', // 更新时间
        })
        .where('conversation_id = :cid', { cid })
        .andWhere('user_id != :senderId', { senderId: uid })
        .execute();

      return message;
    });
  }

  // 读消息 群/私
  async readMessage(data: API_CHAT.ReadMessage['params']) {
    // TODO param use dto
    const { userid: uid, targetId: cid } = data;

    const res = await this.conversationMemberRepo.update(
      {
        conversation: { id: cid },
        user: { id: uid },
      },
      { unread_count: 0 },
    );

    // console.log('res', res);

    return '成功';
  }
}
