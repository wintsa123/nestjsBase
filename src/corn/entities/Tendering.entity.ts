import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, BeforeUpdate, EntitySubscriberInterface, EventSubscriber, InsertEvent, PrimaryColumn } from 'typeorm';
import { Transform, TransformFnParams } from 'class-transformer';
import { baseEntity } from '@src/api/base.entity';
import { dateTimeStringReg } from './../../constants/reg';

@Entity({ name: 'zbdb', database: 'nestapi' })
export class Tendering {
    @PrimaryColumn({
        type: 'varchar',
        name: 'onlyid',
        comment: '主键id',
    })
    onlyid?: string;
    @Column({ type: 'varchar' })
    title?: string;
    @Column({ type: 'datetime' })
    noticeTime?: string|Date;
    @Column({ type: 'varchar' })
    url?: string;
}
