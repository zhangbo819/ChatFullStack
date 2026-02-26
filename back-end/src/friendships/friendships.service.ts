import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { UsersService } from 'src/users/users.service';
import {
  FriendshipStatus,
  FriendshipTable,
} from './entities/friendship.entity';
import { ChatService } from 'src/chat/chat.service';
// import { CreateFriendshipDto } from './dto/create-friendship.dto';
// import { UpdateFriendshipDto } from './dto/update-friendship.dto';

@Injectable()
export class FriendshipsService {
  constructor(
    @InjectRepository(FriendshipTable)
    private readonly repo: Repository<FriendshipTable>,
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}
  // create(createFriendshipDto: CreateFriendshipDto) {
  //   return 'This action adds a new friendship';
  // }
  // findAll() {
  //   return `This action returns all friendships`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} friendship`;
  // }
  // update(id: number, updateFriendshipDto: UpdateFriendshipDto) {
  //   return `This action updates a #${id} friendship`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} friendship`;
  // }

  // 获取一个用户的所有好友
  async getFriends(userId: string) {
    const friendships = await this.repo
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.requester', 'requester')
      .leftJoinAndSelect('f.addressee', 'addressee')
      .where('(addressee.id = :userId AND status = :status)', {
        userId,
        status: FriendshipStatus.ACCEPTED,
      })
      // .andWhere('f.isActive = true')
      .getMany();

    return friendships;
  }

  // 添加好友
  async addFriend(requesterId: string, addresseeId: string) {
    // console.log(
    //   'this.user_friends',
    //   JSON.stringify(this.user_friends, null, 4),
    // );

    const requesterUser = await this.usersService.findOne(addresseeId);

    if (!requesterUser) {
      throw new BadRequestException('该用户不存在');
    }

    if (requesterId === addresseeId) {
      throw new BadRequestException('不能添加自己为好友');
    }

    const addresseeUser = await this.usersService.findOne(requesterId);

    // 校验是否已经加了好友
    const isFriend = await this.repo.findOne({
      where: [
        { requester: { id: requesterId }, addressee: { id: addresseeId } },
        { requester: { id: addresseeId }, addressee: { id: requesterId } },
      ],
      relations: ['requester', 'addressee'],
    });
    if (isFriend) {
      throw new ConflictException('已经是好友不能重复添加');
    }

    // 先自动创建一个私聊会话，保存会话 id 到好有关系表中
    const newPrivateConv = await this.chatService.createPrivateConversation(
      requesterId,
      addresseeId,
    );

    // 开始添加，互加好友
    const newFriendA = this.repo.create({
      requester: requesterUser,
      addressee: addresseeUser,
      status: FriendshipStatus.ACCEPTED,
      conversationId: newPrivateConv.id,
    });
    const newFriendB = this.repo.create({
      requester: addresseeUser,
      addressee: requesterUser,
      status: FriendshipStatus.ACCEPTED,
      conversationId: newPrivateConv.id,
    });
    await this.repo.save(newFriendA);
    await this.repo.save(newFriendB);

    return { errcode: 0, message: '成功', data: [] };
  }
}
