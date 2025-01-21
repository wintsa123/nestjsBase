import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { baseEntity } from '@src/api/base.entity';

@Entity('users')
export class UserEntity extends baseEntity{
  @Column({ unique: true, type: 'bigint' })
  phone?: number|null;

  @Column({default:null, comment: '真实姓名'
  })
  realname?: string;

  @Column()
  @Exclude()
  password?: string;

  @Column({
    type: 'varchar',
    length: 255, // 可选，设置适当长度
    unique: true,
    nullable: true
  })
  email?: string | null;

  @Column({ default: null})
  age?: number;
  @Column({ default:null})
  sex?: number;
  @Column({ default:null})
  evaluation?: string;
  @Column({ default: '+86'})
  areaCode?: string;
  constructor(partial: Partial<UserEntity>={}) {
    super();

    for (const key in partial) {
      if (partial[key] === '') {
        partial[key] = null; // 将空字符串替换为 null
      }
    }
    Object.assign(this, partial);
  }

}
