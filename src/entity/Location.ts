import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  latitude: string;

  @Column()
  longitude: string;
}
