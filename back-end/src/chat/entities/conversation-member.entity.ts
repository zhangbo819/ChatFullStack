import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserTable } from 'src/users/users.entity';
import { ConversationTable } from './conversation.entity';

export enum ConverastionRole {
  MEMBER = 0, // 成员
  MANAGER = 1, // 管理员
  OWNER = 2, // 群主
}

@Entity('conversation_members')
@Index(['conversation', 'user'], { unique: true })
export class ConversationMemberTable {
  @PrimaryGeneratedColumn()
  id: number;

  // 会话 id
  @ManyToOne(() => ConversationTable)
  @JoinColumn({ name: 'conversation_id' })
  conversation: ConversationTable;

  // 用户 id
  @ManyToOne(() => UserTable)
  @JoinColumn({ name: 'user_id' })
  user: UserTable;

  // 权限
  @Column({
    type: 'enum',
    enum: ConverastionRole,
    default: ConverastionRole.MANAGER,
  })
  role: ConverastionRole;

  @Column({ nullable: true })
  nickname: string;

  // // 此用户最后一条读的信息
  // @Index()
  // @Column({ type: 'uuid', nullable: true })
  // lastReadMessageId: string;

  // 未读消息数
  @Column({ default: 0 })
  unread_count: number;

  // // 这个成员是否关闭了该会话的通知
  // @Column({ default: false })
  // isMuted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
