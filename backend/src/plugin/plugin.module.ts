import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';
import { ToolsService } from './tools/tools.service';
import { RedisService } from './redis/redis.service';
import { IpToAddressService } from './lbsMap/ip-to-address.service';
import {  LngLat } from './lbsMap/get-longitude-latitude';

import { UploadImgService } from './file/upload-img.service';
import { PrismaService } from './prisma/prisma.service';

@Global()
@Module({
  providers: [LoggerService, ToolsService, RedisService, IpToAddressService, UploadImgService,LngLat,PrismaService],
  exports: [LoggerService, ToolsService, RedisService, IpToAddressService, UploadImgService,LngLat,PrismaService],
})
export class PluginModule {}
