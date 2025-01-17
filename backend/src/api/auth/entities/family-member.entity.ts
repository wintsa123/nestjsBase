import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('family_members')
export class FamilyMember {
  @PrimaryGeneratedColumn('uuid')
  id?: string ;

  @Column()
  name?: string ;

  @Column({ nullable: true })
  birthDate?: Date ;

  @Column({ nullable: true })
  deathDate?: Date;

  @Column({ nullable: true })
  birthPlace?: string;

  @Column({ type: 'text', nullable: true })
  biography?: string;

  @Column({ nullable: true })
  photo?: string;

  @Column({ nullable: true })
  fatherId?: string;

  @Column({ nullable: true })
  motherId?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  createdBy?: User;

  @Column()
  createdById?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
