import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { formatDate } from '../utils';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    let resultCode = 1;

    const { code, msg, ...oth } = exception

    Logger.log(exception, '错误提示');

    const errorResponse = {
      status,
      message: msg,
      code: resultCode, // 自定义code
      params: typeof exception=='string'?exception:oth,
      path: request.url, // 错误的url地址
      method: request.method, // 请求方式
      timestamp: new Date().toLocaleDateString(), // 错误的时间
    };
    // 打印日志
    Logger.error(
      `【${formatDate(Date.now())}】${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
      'HttpExceptionFilter'
    );
    // 设置返回的状态码、请求头、发送错误信息
    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(errorResponse);
  }
}
