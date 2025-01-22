import { Module } from '@nestjs/common';

import { TmpRedisModule } from './tmp-redis/tmp-redis.module';
import { userModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    TmpRedisModule,
    userModule,
    AuthModule
  ],
})
export class ApiModule {}
