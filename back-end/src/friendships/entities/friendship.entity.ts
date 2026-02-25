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

export enum FriendshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  BLOCKED = 'blocked',
}

@Entity('friendships')
@Index(['requester', 'addressee'], { unique: true })
export class FriendshipTable {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserTable) // 申请者 uid
  @JoinColumn({ name: 'requester_id' })
  requester: UserTable;

  @ManyToOne(() => UserTable) // 接收人 uid
  @JoinColumn({ name: 'addressee_id' })
  addressee: UserTable;

  @Column({
    type: 'enum',
    enum: FriendshipStatus,
    default: FriendshipStatus.PENDING,
  })
  status: FriendshipStatus;

  // // 操作者 id 记录 谁拒绝 谁拉黑 谁解除
  // @Column({ type: 'uuid', nullable: true })
  // actionUserId: string;

  // 记录来自于什么会话，不需要再进行查找
  @Column({ type: 'uuid', nullable: true })
  conversationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
