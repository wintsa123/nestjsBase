import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, BeforeUpdate, EntitySubscriberInterface, EventSubscriber, InsertEvent, PrimaryColumn } from 'typeorm';
import { Transform, TransformFnParams } from 'class-transformer';
import { baseEntity } from '@src/api/base.entity';

@Entity({ name: 'zbkey', database: 'nestapi' })
export class Zbkey extends baseEntity{
   
    @Column({ type: 'varchar' })
    key?: string;
   
}
