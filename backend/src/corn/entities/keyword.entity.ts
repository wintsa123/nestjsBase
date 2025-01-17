import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, BeforeUpdate, EntitySubscriberInterface, EventSubscriber, InsertEvent, PrimaryColumn } from 'typeorm';
import { Transform, TransformFnParams } from 'class-transformer';
import { baseEntity } from '@src/api/base.entity';

@Entity({ name: 'hotkeyword', database: 'nestapi' })
export class hotKeyword extends baseEntity {
    @PrimaryGeneratedColumn({
        type: 'int',
        name: 'id',
        comment: '主键id',
      })
      id!: number;

   
    @Column({ type: 'varchar' })
    type?: string;
    @Column({ type: 'varchar' })
    partment?: string;
    @Column({ type: 'varchar' })
    keyword?: string;
    @Column({ type: 'int' })
    num?: number;
    constructor(data?: Partial<hotKeyword>) {
        super();
        Object.assign(this, data);
    }
}
