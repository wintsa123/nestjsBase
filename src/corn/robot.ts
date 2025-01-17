import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import axios from 'axios';
import { CronJob } from 'cron';
import { Connection, MoreThan, Repository, createConnection } from 'typeorm';

import moment from 'moment';
import { IS_DEV } from '@src/utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Tendering } from './entities/Tendering.entity';
import { chunk, differenceBy, flatMap } from 'lodash';
import { TmpRedisService } from '@src/api/tmp-redis/tmp-redis.service';
import { wxrobot } from './entities/robot.entity';
import { Zbkey } from './entities/zbKey.entity';
import { RedisService } from '@src/plugin/redis/redis.service';
import { spiderdata } from '@src/api/tmp-redis/entities/spiderData.entity';


@Injectable()
export class TasksService {
    constructor(
        private schedule: SchedulerRegistry,
    ) {
    }
    private readonly logger = new Logger(TasksService.name);
}
