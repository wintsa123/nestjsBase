// cron.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './robot';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tendering } from './entities/Tendering.entity';
import { hotKeyword } from './entities/keyword.entity';
import { oldhistroy } from './entities/oldHistroy.entity';
import { wxrobot } from './entities/robot.entity';
import { TmpRedisService } from '@src/api/tmp-redis/tmp-redis.service';

import { Zbkey } from './entities/zbKey.entity';
import { spiderdata } from '@src/api/tmp-redis/entities/spiderData.entity';



@Module({
    imports: [ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Tendering, hotKeyword, oldhistroy, wxrobot, Zbkey, spiderdata]),
    ],
    providers: [TasksService, TmpRedisService]
})
export class CronModule { }
