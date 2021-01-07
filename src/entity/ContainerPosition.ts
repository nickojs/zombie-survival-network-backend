import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ContainerPosition {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  position: string;
}
