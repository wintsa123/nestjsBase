import { Module } from '@nestjs/common';

import { TmpRedisModule } from './tmp-redis/tmp-redis.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    TmpRedisModule,
    AuthModule
  ],
})
export class ApiModule {}
