import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserTable } from 'src/users/users.entity';
import { ConversationTable } from './conversation.entity';

enum MessageType {
  TEXT = 'text', // 文本消息
}

@Entity('messages')
@Index(['conversation', 'createdAt'])
export class MessageTable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 会话 id
  @Index()
  @ManyToOne(() => ConversationTable)
  @JoinColumn({ name: 'conversation_id' })
  conversation: ConversationTable;

  // 发送人 id
  @Index()
  @ManyToOne(() => UserTable)
  @JoinColumn({ name: 'sender_id' })
  sender: UserTable;

  // 类型
  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  // 发送内容
  @Column({ type: 'text', nullable: true })
  content: string;

  // // 文件信息、图片尺寸等
  // @Column({ type: 'jsonb', nullable: true })
  // meta: Record<string, any>;

  // // 消息状态，撤回 删除 审核等
  // @Column({
  //   type: 'enum',
  //   enum: MessageStatus,
  //   default: MessageStatus.NORMAL,
  // })
  // status: MessageStatus;

  // // 引用消息
  // @Column({ type: 'uuid', nullable: true })
  // replyToId: string;

  @CreateDateColumn()
  createdAt: Date;
}
