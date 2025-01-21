import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import axios from 'axios';
import { CronJob } from 'cron';
import { Connection, MoreThan, Repository, createConnection } from 'typeorm';

import moment from 'moment';
import { IS_DEV } from '@src/utils';
import { InjectRepository } from '@nestjs/typeorm';

import { chunk, differenceBy, flatMap } from 'lodash';
import { TmpRedisService } from '@src/api/tmp-redis/tmp-redis.service';
import { RedisService } from '@src/plugin/redis/redis.service';


@Injectable()
export class TasksService {
    constructor(
        private schedule: SchedulerRegistry,
    ) {
    }
    private readonly logger = new Logger(TasksService.name);
}
