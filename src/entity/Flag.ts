import {
  CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn
} from 'typeorm';
import { User } from './User';

@Entity()
export class Flag {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, (user) => user.flags)
  user: User;

  @ManyToOne(() => User, (user) => user.flags)
  flaggedBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
