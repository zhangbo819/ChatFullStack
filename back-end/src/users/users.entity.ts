import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;
}
