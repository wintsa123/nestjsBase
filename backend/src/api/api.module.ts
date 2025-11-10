import { Module } from '@nestjs/common';

import { TmpRedisModule } from './tmp-redis/tmp-redis.module';
import { userModule } from './user/user.module';
import { UploadModule } from './upLoad/upload.module';


@Module({
  imports: [
    TmpRedisModule,
    userModule,UploadModule
    
  ],
})
export class ApiModule {}
