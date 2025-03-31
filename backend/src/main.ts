import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common/enums';
import { AppModule } from './app.module';
import { getConfig, IS_DEV } from './utils';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { fastifyHelmet } from '@fastify/helmet';
import * as fastifyXmlBody from 'fastify-xml-body-parser';
import fastifyMultipart from '@fastify/multipart';

import fastifyCsrf from '@fastify/csrf-protection';
import { fastifyCookie } from '@fastify/cookie';
import { SetMetadata, VersioningOptions, Logger } from '@nestjs/common';
export const config = getConfig();
const PORT = config.PORT || 9089;
const PREFIX = config.PREFIX || '/';
async function bootstrap() {
  try {
    const logger: Logger = new Logger('main.ts');
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({
     logger: true,
      bodyLimit: 10485760, // 设置请求正文大小限制为 10MB (单位为字节)
    }), {
      logger: IS_DEV ? ['log', 'debug', 'error', 'warn'] : ['error', 'warn', 'debug'],
    });
    app.enableCors({
      "origin": "*",
      // origin: 'http://localhost:5173', // 设置允许的前端来源
      "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "preflightContinue": false,
      "optionsSuccessStatus": 200,
      "credentials": true,
      allowedHeaders: '*', // 明确列出允许的头部
      exposedHeaders: '*', // 允许所有的响应头

    });
    // 启动版本管理
    const Version = {
      defaultVersion: '1', // 不指定默认版本为v1
      type: VersioningType.URI,
    }
    app.enableVersioning(Version as VersioningOptions);

    SetMetadata('Version', Version)(AppModule);
  

    app.register(fastifyXmlBody);
    app.register(fastifyMultipart, {
      limits: {
        fieldNameSize: 100, // Max field name size in bytes
        fieldSize: 100,     // Max field value size in bytes
        fields: 10,         // Max number of non-file fields
        fileSize: 100000000,  // For multipart forms, the max file size in bytes
        files: 30,           // Max number of file fields
        headerPairs: 2000,  // Max number of header key=>value pairs
        parts: 1000         // For multipart forms, the max number of parts (fields + files)
      },
    });
    app.register(fastifyCookie, {
      secret: 'wintsa', // for cookies signature
    });
    app.register(fastifyCsrf);

    app.register(
      fastifyHelmet,
      {
        contentSecurityPolicy: false,

      },

    )
    // 给请求添加prefix

    app.setGlobalPrefix(PREFIX);


    const config = new DocumentBuilder()
      .setTitle('Api example')
      .setDescription('临时接口调试')
      .setVersion('1.0')
      .setLicense('Apache 2.0', 'http://www.apache.org/licenses/LICENSE-2.0.html')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: '输入 JWT Token',
          in: 'header',
        },
        'JWT-auth', // 安全方案的名称（可自定义）
      )
      .build();

    const fastifyInstance = app.getHttpAdapter().getInstance();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(PORT, '0.0.0.0', () => {
      logger.log(`服务已经启动,接口请访问:http://127.0.0.1:${PORT}/${PREFIX}`);
    });

  } catch (error) {
    console.log(error)
    await bootstrap()
    throw error
  }

}

bootstrap();
