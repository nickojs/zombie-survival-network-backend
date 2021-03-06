import { IsNotEmpty, Max, Min } from 'class-validator';
import {
  Column, Entity, ManyToOne, PrimaryGeneratedColumn
} from 'typeorm';
import { User } from './User';

@Entity()
export class Item {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @IsNotEmpty({ message: 'Invalid item id provided' })
  @Column()
  OSRSId: string;

  @ManyToOne(() => User, (user) => user.items)
  user: User;
}
