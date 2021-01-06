import { IsEmail, Length, MinLength } from 'class-validator';
import {
  BeforeInsert,
  Column, Entity, JoinColumn, JoinTable, OneToMany, OneToOne, PrimaryGeneratedColumn
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserProfile } from './Profile';
import { UserLocation } from './Location';
import { Flag } from './Flag';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Length(4, 16, {
    message: 'Username should range between 4 and 16 characters'
  })
  @Column({ unique: true })
  username: string;

  @IsEmail({ }, { message: 'Invalid email' })
  @Column({ unique: true })
  email: string;

  @MinLength(8, {
    message: 'Password should have at least 8 characters'
  })
  @Column()
  password: string;

  @OneToOne(() => UserProfile)
  @JoinColumn()
  profile: UserProfile;

  @OneToOne(() => UserLocation)
  @JoinColumn()
  location: UserLocation;

  @OneToMany(() => Flag, (flag) => flag.user)
  @JoinTable({ name: 'user_flags' })
  flags: Flag[];

  @BeforeInsert()
  async hashPassword() {
    const hashedPw = await bcrypt.hash(this.password, 12);
    this.password = hashedPw;
  }
}
