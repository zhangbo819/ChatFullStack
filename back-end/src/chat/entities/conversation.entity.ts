import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

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

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  avatar: string;

  // lastMessageId 最后一条数据
  @Index()
  @Column({ type: 'uuid', nullable: true })
  lastMessageId: string;

  // 私聊唯一键 (userA_userB)
  @Index({ unique: true })
  @Column({ nullable: true })
  privateKey: string;

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
