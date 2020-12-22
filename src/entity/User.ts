import { IsEmail, Length, MinLength } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
