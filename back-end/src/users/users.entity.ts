import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum OnlineStatus {
  OFFLINE = 0,
  ONLINE = 1,
}

@Entity()
export class UserTable {
  @PrimaryGeneratedColumn()
  id: number; // 内部数据库主键

  @Column({ type: 'uuid', unique: true })
  uuid: string; // 对外业务ID

  @Column()
  name: string;

  //   @Column({ unique: true })
  //   email: string;

  @Column()
  avatar: string;

  @Column('text', { array: true })
  friends: string[];

  @Column({
    type: 'enum',
    enum: OnlineStatus,
    default: OnlineStatus.OFFLINE,
  })
  online: OnlineStatus;
}

export type User = UserTable;
