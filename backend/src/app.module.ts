import { ClassSerializerInterceptor, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { HttpExceptionFilter } from './filters/http-exception.filter';
import {
  LoggerInterceptor,
  RedisCacheInterceptor,
  RedisLimitInterceptor,
  ApiInterceptor,
} from './interceptors';
import { ValidationPipe } from './pipe/validation.pipe';
import { getConfig } from './utils';
import { ApiModule } from './api/api.module';
import { PluginModule } from './plugin/plugin.module';
import { SocketModule } from './socket/socket.module';
import { CronModule } from './corn/rebot.module';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: false, // 忽视默认读取.env的文件配置
      isGlobal: true, // 全局注入
      load: [getConfig], // 加载配置文件
    }),
    // mysql的连接
  

    CronModule,
    ApiModule,
    PluginModule,
    SocketModule,
  ],
  providers: [
    Logger,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RedisLimitInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RedisCacheInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiInterceptor,
    },
    // 全局使用管道(数据校验)
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    // 全局使用过滤器
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
   
  ],
})
export class AppModule {
}