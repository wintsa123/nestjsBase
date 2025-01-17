import { Module } from '@nestjs/common';

import { TmpRedisModule } from './tmp-redis/tmp-redis.module';


@Module({
  imports: [
    
    TmpRedisModule,

  ],
})
export class ApiModule {}
