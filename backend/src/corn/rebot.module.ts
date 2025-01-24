// cron.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './robot';

import { TmpRedisService } from '@src/api/tmp-redis/tmp-redis.service';





@Module({
    imports: [ScheduleModule.forRoot(),
    ],
    providers: [TasksService, TmpRedisService]
})
export class CronModule { }
