import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { user } from './dto/user.dto';
import { PrismaService } from '@src/plugin/prisma/prisma.service';
import { LoggerService } from '@src/plugin/logger/logger.service';
import { Prisma } from '@prisma/client';
import { BigIntreplacer } from '@src/utils';

@Injectable()
export class userService {
  constructor(
    private pgService: PrismaService,
    private jwtService: JwtService,
    private logger: LoggerService,
  ) { }

  async findOne(userData: { phone?: number | null; email?: string | null }) : Promise<Prisma.UserCreateInput>{
    try {

      const whereConditions: any = {};

      // 检查并添加有效的phone条件
      if (userData.phone != null) {
        whereConditions['phone'] = userData.phone;
      }

      // 检查并添加有效的email条件
      if (userData.email != null) {
        whereConditions['email'] = userData.email;
      }
      
      // 如果至少有一个条件（phone或email），执行查询
      if (Object.keys(whereConditions).length === 0) {
        throw new Error('必须提供 phone 或 email 其中一项');
      }
      const user = await this.pgService.user.findUnique({
        where: whereConditions
      })
      if (!user) {
        throw '用户不存在';

      }

      return BigIntreplacer(user)
    } catch (error: any) {
      this.logger.error(error)
      throw error
    }
  }

  async validateUser(phone: number, email: string, password: string): Promise<any> {
    try {
      const user = await this.findOne({ phone, email });
      if (user && await bcrypt.compare(password, user.password)) {
        const { password, ...result } = user;
        return result;
      } else {
        throw '密码不正确';

      }
    } catch (error:any) {
      this.logger.error(error)
      throw error.meta.cause
    }
  }

  async login(user: any) {
    console.log(user)
    const TokenPayload = {
      sub: user.id, key: user.phone ? `phone:${user.phone}` : `email:${user.email}`
    };

    const accessToken = this.jwtService.sign(TokenPayload);

    // 生成 refresh_token
    const refreshToken = this.jwtService.sign(TokenPayload, {
      expiresIn: '7d', // refresh_token 有效期为 7 天
      secret: process.env.JWT_refreshSECRET || 'wintsa_refresh', // 使用自定义密钥
    });

    // 计算 token 的生效时间和过期时间
    const now = Math.floor(Date.now() / 1000); // 当前时间（秒）
    const accessTokenExpiresIn = 3600; // access_token 有效期为 1 小时（秒）
    const accessTokenExpiresAt = now + accessTokenExpiresIn; // 过期时间

    // 返回结果
    // const { password, ...result } = savedUser; // 排除密码字段
    return {
      token: accessToken,
      refresh_token: refreshToken,
      tokenExpireTime: accessTokenExpiresAt
    };
  }
  async register(userData: { phone: number; password: string; email: string }) {
    try {


      // 检查手机号是否已注册
      let users: Prisma.UserCreateInput = {}

      if (userData.phone) {

        const existingUserByPhone = await this.pgService.user.findUnique({
          where: { phone: userData.phone },
        });
        if (existingUserByPhone) {
          throw new UnauthorizedException('该手机已被注册');
        }
        users = {
          phone: userData.phone,
        }
      }

      // 检查邮箱是否已注册
      if (userData.email) {
        const existingUserByEmail = await this.pgService.user.findUnique({
          where: { email: userData.email },
        });

        if (existingUserByEmail) {
          throw new UnauthorizedException('该邮箱已被注册');
        }
        users = {
          email: userData.email,
        }
      }

      // 哈希密码
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      users.password = hashedPassword


      //  保存用户

      const createUser = await this.pgService.user.create({ data: users })
      // 生成 access_token
      const TokenPayload = {
        sub: createUser.id, key: createUser.phone ? `phone:${createUser.phone}` : `email:${createUser.email}`
      };
      const accessToken = this.jwtService.sign(TokenPayload);

      // 生成 refresh_token

      const refreshToken = this.jwtService.sign(TokenPayload, {
        expiresIn: '7d', // refresh_token 有效期为 7 天
        secret: process.env.JWT_refreshSECRET || 'wintsa_refresh', // 使用自定义密钥
      });

      // 计算 token 的生效时间和过期时间
      const now = Math.floor(Date.now() / 1000); // 当前时间（秒）
      const accessTokenExpiresIn = 3600; // access_token 有效期为 1 小时（秒）
      const accessTokenExpiresAt = now + accessTokenExpiresIn; // 过期时间

      // 返回结果
      return {
        token: accessToken,
        refresh_token: refreshToken,
        tokenExpireTime: accessTokenExpiresAt
      };
    } catch (error: any) {
      this.logger.error(error)
      throw error
    }
  }
}
