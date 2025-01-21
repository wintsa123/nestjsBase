import { ClassSerializerInterceptor, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

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

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: false, // 忽视默认读取.env的文件配置
      isGlobal: true, // 全局注入
      load: [getConfig], // 加载配置文件
    }),
    // mysql的连接
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return (
          {
            type: 'mysql',
            name: "default",
            host: String(configService.get('datasource.host')),
            port: Number.parseInt(configService.get('datasource.port') ?? '3306'),
            username: String(configService.get('datasource.username')),
            password: String(configService.get('datasource.password')),
            database: String(configService.get('datasource.database')),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            logging: configService.get('datasource.logging'),
            timezone: '+08:00', // 东八区
            autoLoadEntities: true,
            synchronize:  true, // 自动同步表结构
            cache: {
              duration: 60000, // 1分钟的缓存
            },
          }
        )
      },
    }),

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
    }
   
  ],
})
export class AppModule {
}