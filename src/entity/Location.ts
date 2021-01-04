import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column()
  latitude: number;

  @IsNotEmpty()
  @Column()
  longitude: number;
}
