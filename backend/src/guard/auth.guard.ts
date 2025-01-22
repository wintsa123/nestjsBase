// src/auth/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@src/api/user/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      // 默认字段是 'username' 和 'password'，可自定义
      usernameField: 'username', // 如果使用邮箱作为登录字段
      passwordField: 'password',
    });
  }

  async validate(phone:number,email: string, password: string): Promise<any> {
    // 调用 AuthService 验证用户
    const user = await this.authService.validateUser(phone, password,email);
    if (!user) {
      throw new UnauthorizedException('无效的邮箱或密码');
    }
    return user; // 验证通过后返回用户信息，会被附加到请求对象 req.user
  }
}