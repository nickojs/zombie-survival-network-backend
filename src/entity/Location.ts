import { IsNumber } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNumber({}, { message: 'Latitude should be a number' })
  @Column()
  latitude: number;

  @IsNumber({}, { message: 'Longitude should be a number' })
  @Column()
  longitude: number;
}
