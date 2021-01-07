import { IsNotEmpty, Max, Min } from 'class-validator';
import {
  Column, Entity, ManyToOne, PrimaryGeneratedColumn
} from 'typeorm';
import { User } from './User';

@Entity()
export class Item {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @IsNotEmpty()
  @Column()
  OSRSId: string;

  @Min(0)
  @Max(28)
  @Column()
  qtd: number;

  @ManyToOne(() => User, (user) => user.items)
  user: User;
}
