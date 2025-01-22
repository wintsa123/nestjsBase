import { Module } from '@nestjs/common';

import { TmpRedisModule } from './tmp-redis/tmp-redis.module';
import { AuthModule } from './user/user.module';


@Module({
  imports: [
    TmpRedisModule,
    AuthModule
  ],
})
export class ApiModule {}
