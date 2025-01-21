import { Body, Controller, Get, Post, Put, Query, Req, Res, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { TmpRedisService } from './tmp-redis.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipAuth } from '@src/decorators/skip-auth';
import { url } from './dto/url.dto';
import { RedisCacheApi } from '@src/decorators';
@ApiTags('utils')
@Controller('tmp-redis')
@SkipAuth() // 跳过控制器级别的验证

export class TmpRedisController {
  constructor(private readonly tmpRedisService: TmpRedisService,

  ) { }
  @Post('/cleanall')
  @ApiOperation({ summary: '调用该接口可清空redis缓存,非常不建议随意使用，例如在一些缓存级别的接口，文档处理/任务id生成，如果参数一致不重复处理，如果清理缓存后，同一个文件重复处理会报错' })
  cleanall() {
    return this.tmpRedisService.cleanAll();
  }
 

 
  @ApiOperation({ summary: '生产二维码' })
  @Post('/qrcode')
  @RedisCacheApi({ exSecond: 604800 })
  async qrcode(@Body() data:url) {
    // 将文件传递给你的服务进行处理
    const result = await this.tmpRedisService.qrcode(data);
    return result;
  }
  // @ApiOperation({ summary: 'redisLike' })
  // @Post('/redisLike')
  // async redisLike(@Body() data:url) {
  //   const result = await this.tmpRedisService.redisLike(data.key)
  //   return result;
  // }
  
}
