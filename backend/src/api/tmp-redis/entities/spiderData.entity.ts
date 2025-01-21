import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, BeforeUpdate, EntitySubscriberInterface, EventSubscriber, InsertEvent, PrimaryColumn } from 'typeorm';
import { Transform, TransformFnParams } from 'class-transformer';
import { baseEntity } from '@src/api/base.entity';

// @Entity({ name: 'spiderdata', database: 'nestapi' })
export class spiderdata {
    @PrimaryColumn({
        type: 'varchar',
        name: 'id',
        comment: '主键id',
    })
    id?: string;
    @Transform((row: TransformFnParams) => +new Date(row.value))
    @CreateDateColumn({
        type: 'timestamp',
        nullable: false,
        name: 'created_at',
        comment: '创建时间',
    })
    createdAt!: Date;
    @Column({ type: 'varchar' })
    title?: string;
    @Column({ type: 'datetime' })
    time?: Date|string;
    @Column({ type: 'text' })
    url?: string;
    @Column({
        type: 'boolean',
        default: false,
        comment: '发送标志'
    }) 
    sendFlag?: boolean;
}
