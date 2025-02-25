import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    // 默认状态码设置为 200
    // response.statusCode = 200;

    // 获取请求的 URL 和方法
    const url = request.url;
    const method = request.method;

    // 根据接口动态设置 message
    let customMessage = '请求成功'; // 默认消息
    if (url.includes('/wxchat/getMsg')) {
      customMessage = '获取消息成功';
    } else if (url.includes('/user/register') && method === 'POST') {
      customMessage = '注册成功，即将进入族谱';
    } else if (url.includes('/user/login') && method === 'POST') {
      customMessage = '登录成功';
    }

    // 将自定义消息存储到 request.state 中（可选）
    request.state = { message: customMessage };

    // 如果是特定接口，直接返回原始数据
    if (url.includes('/wxchat/getMsg')) {
      return next.handle();
    }

    // 对其他接口统一格式化响应
    return next.handle().pipe(
      map((data: any) => {
        return {
          data: instanceToPlain(data),
          code: 0,
          message: customMessage, // 使用自定义消息
        };
      }),
    );
  }
}