import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MessageTable } from './message.entity';

export enum ConversationType {
  PRIVATE = 'private',
  GROUP = 'group',
  // 'system'
}

@Entity('conversations')
export class ConversationTable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ConversationType,
  })
  type: ConversationType;

  // TODO 将最后一条信息内容拆解成多个字段，查询时少一个 join
  // lastMessageId 最后一条数据
  // @Index()
  // @Column({ type: 'uuid', nullable: true })
  // lastMessageId: string;
  @ManyToOne(() => MessageTable)
  @JoinColumn({ name: 'last_message_id' })
  lastMessage: MessageTable;

  // 私聊唯一键 (userA_userB)
  @Index({ unique: true })
  @Column({ nullable: true })
  privateKey: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  avatar: string;

  // 创建者
  @Column({ type: 'uuid', nullable: true })
  creatorId: string;

  // 成员数缓存
  @Column({ default: 0 })
  memberCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
