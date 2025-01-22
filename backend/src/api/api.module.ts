import { Module } from '@nestjs/common';

import { TmpRedisModule } from './tmp-redis/tmp-redis.module';
import { userModule } from './user/user.module';


@Module({
  imports: [
    TmpRedisModule,
    userModule
    
  ],
})
export class ApiModule {}
