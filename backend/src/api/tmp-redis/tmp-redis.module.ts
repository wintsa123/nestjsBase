import {  Module } from '@nestjs/common';
import { TmpRedisService } from './tmp-redis.service';
import { TmpRedisController } from './tmp-redis.controller';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
   
    RouterModule.register([
      {
        path: '', // 指定项目名称
        module: TmpRedisModule,
      },
    ]),

  ],
  controllers: [TmpRedisController],
  providers: [TmpRedisService],
  // exports: [TmpRedisModule], // 导出 ZhiyinService，以便其他模块能够导入并使用

})
export class TmpRedisModule { }
