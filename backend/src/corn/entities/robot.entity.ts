import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, BeforeUpdate, EntitySubscriberInterface, EventSubscriber, InsertEvent, PrimaryColumn } from 'typeorm';
import { Transform, TransformFnParams } from 'class-transformer';
import { baseEntity } from '@src/api/base.entity';

@Entity({ name: 'wxrobot', database: 'nestapi' })
export class wxrobot extends baseEntity {
    @PrimaryGeneratedColumn({
        type: 'int',
        name: 'id',
        comment: '主键id',
    })
    id!: number;
    @Column({ type: 'varchar' })
    title?: string;

    @Column({ type: 'varchar' })
    url?: string;
}
