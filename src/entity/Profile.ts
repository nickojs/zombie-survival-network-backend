import {
  IsEnum, IsNumber, Length, Max, Min
} from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Length(4, 99, { message: 'Invalid full name length' })
  @Column()
  fullName: string;

  @IsNumber()
  @Min(0)
  @Max(99)
  @Column()
  age: number;

  @IsEnum(Gender, { message: 'Invalid gender value' })
  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.MALE
  })
  gender: Gender
}
