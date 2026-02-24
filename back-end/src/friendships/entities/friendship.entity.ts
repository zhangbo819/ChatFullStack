import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserTable } from 'src/users/users.entity';

@Entity()
export class FriendshipTable {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserTable) // 申请者 uid
  requester: UserTable;

  @ManyToOne(() => UserTable) // 接收人 uid
  addressee: UserTable;

  @Column({ default: 'pending' })
  status: 'pending' | 'accepted' | 'blocked';

  //   isActive   // 是否当前生效

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
