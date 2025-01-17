import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { RedisService } from '@src/plugin/redis/redis.service';
import { getUrlQuery } from '@src/utils';
import axios from 'axios';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly redisService: RedisService, private readonly configService: ConfigService, private reflector: Reflector
  ) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipAuth = this.reflector.get<boolean>('skipAuth', context.getClass())||this.reflector.get<boolean>('skipAuth', context.getHandler())
    if (skipAuth ) {
      return true; // 如果有 SkipAuth 装饰器，跳过认证
    }
    const request = context.switchToHttp().getRequest();
  
   
    const token = request.headers['token']
   
    
    // 获取请求的 IP 地址
    const requestIp = request.ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    // 白名单 IP 列表
    const whiteIpList = ['192.168.2.221', '127.0.0.1']; // 替换成你的白名单 IP
  
    // 如果 IP 在白名单中，直接通过
    if (whiteIpList.includes(requestIp)) {
      return true;
    }
    try {
      const boolen = await this.validateSecretKey(token)
      if (boolen) {
        // 如果传递了token的话就要从redis中查询是否有该token
        return true;
      } else {
        throw new HttpException(
          JSON.stringify({ code: 10024, message: '你还没登录,请先登录' }),
          HttpStatus.OK
        );
      }
    } catch (error) {
      throw error
    }


  }
  private async validateSecretKey(id: string): Promise<boolean> {
    // 这里检查秘钥的逻辑
    const url = this.configService.get('getToken')
    const url1 = this.configService.get('checkToken')
    const appid = this.configService.get('oaAppid')
    try {
      const { data } = await axios.post(url, { loginid: id, appid }, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      });
      const { data: result } = await axios.post(url1, { token: data }, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      });

      return result;
    } catch (error) {
      throw error
    }

  }
}
