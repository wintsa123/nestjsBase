import { Global, Module } from '@nestjs/common';
import { TmpRedisService } from './tmp-redis.service';
import { TmpRedisController } from './tmp-redis.controller';
import { RouterModule } from '@nestjs/core';
import { Tendering } from '@src/corn/entities/Tendering.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { hotKeyword } from '@src/corn/entities/keyword.entity';
import { oldhistroy } from '@src/corn/entities/oldHistroy.entity';
import { wxrobot } from '@src/corn/entities/robot.entity';
import { Zbkey } from './../../corn/entities/zbKey.entity';
import { spiderdata } from './entities/spiderData.entity';

@Module({
  imports: [
   
    RouterModule.register([
      {
        path: '', // 指定项目名称
        module: TmpRedisModule,
      },
    ]),
    TypeOrmModule.forFeature([Tendering, hotKeyword, oldhistroy, wxrobot, Zbkey, spiderdata]),

  ],
  controllers: [TmpRedisController],
  providers: [TmpRedisService],
  // exports: [TmpRedisModule], // 导出 ZhiyinService，以便其他模块能够导入并使用

})
export class TmpRedisModule { }
