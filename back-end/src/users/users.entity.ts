import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OnlineStatus {
  OFFLINE = 0,
  ONLINE = 1,
}

@Entity()
export class UserTable {
  @PrimaryGeneratedColumn('uuid') // uuid 对外业务ID，不暴露内部信息
  id: string; // 内部数据库主键

  // @Column({ type: 'uuid', unique: true })
  // uuid: string; // 对外业务ID

  @Column()
  name: string;

  //   @Column({ unique: true })
  //   email: string;

  // TODO 增加好友表
  // @Column('text', { array: true })
  // friends: string[];

  @Column({
    type: 'enum',
    enum: OnlineStatus,
    default: OnlineStatus.OFFLINE,
  })
  online: OnlineStatus;

  @Column()
  avatar: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// TODO type User use dto
export type User = UserTable;
