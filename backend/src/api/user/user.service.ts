import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { PrismaService } from '@src/plugin/prisma/prisma.service';
import { LoggerService } from '@src/plugin/logger/logger.service';
import { Prisma } from '@prisma/client';
import { BigIntreplacer } from '@src/utils';
import { RedisService } from '@src/plugin/redis/redis.service';

@Injectable()
export class userService {
  constructor(
    private pgService: PrismaService,
    private jwtService: JwtService,
    private logger: LoggerService,
    private readonly redisService: RedisService,
  ) { }

  async findOne(userData: { phone?: string | null; email?: string | null }) {
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

  async validateUser(phone: string, email: string, password: string): Promise<any> {
    try {
      const user = await this.findOne({ phone, email });
      if (user && await bcrypt.compare(password, user.password)) {
        const { password, ...result } = user;
        return result;
      } else {
        throw '密码不正确';

      }
    } catch (error: any) {
      this.logger.error(error)
      throw error.meta?.cause || error
    }
  }

  async login(user: any) {
    const TokenPayload = {
      sub: user.id, key: user.phone ? `phone:${user.phone}` : `email:${user.email}`
    };
    const accessToken = this.jwtService.sign(TokenPayload);
 
    if (!user) {
      throw new Error('User not found');
    }
    // 生成 refresh_token
    const redisKey = `user:${user.id}:version`; // Redis key 为 用户 ID + 版本号
    const refreshPayload = { sub: user.id, version: 1 };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: '7d', // refresh_token 有效期为 7 天
      secret: process.env.JWT_refreshSECRET || 'wintsa_refresh', // 使用自定义密钥
    });

    // 计算 token 的生效时间和过期时间
    const now = Math.floor(Date.now() / 1000); // 当前时间（秒）

    const redisExpireTime = now + 7 * 24 * 60 * 60; // 设置为 7 天有效期
    await this.redisService.set(redisKey, 1, redisExpireTime); // 更新版本号
    // 返回结果

    return {
      token: accessToken,
      refresh_token: refreshToken,
      tokenExpireTime: now + 3600
    };
  }
  async register(userData: { phone: string; password: string; email: string, realname: string, sex: number }) {
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

      users.realname = userData.realname
      users.sex = userData.sex

      //  保存用户

      const createUser = await this.pgService.user.create({ data: users })
      // 生成 access_token
      const TokenPayload = {
        sub: createUser.id, key: createUser.phone ? `phone:${createUser.phone}` : `email:${createUser.email}`
      };
      const accessToken = this.jwtService.sign(TokenPayload);

      // 生成 refresh_token
      const redisKey = `user:${createUser.id}:version`; // Redis key 为 用户 ID + 版本号
      const refreshPayload = { sub: createUser.id, version: 1 };
      const refreshToken = this.jwtService.sign(refreshPayload, {
        expiresIn: '7d', // refresh_token 有效期为 7 天
        secret: process.env.JWT_refreshSECRET || 'wintsa_refresh', // 使用自定义密钥
      });

      // 计算 token 的生效时间和过期时间
      const now = Math.floor(Date.now() / 1000); // 当前时间（秒）

      const redisExpireTime = now + 7 * 24 * 60 * 60; // 设置为 7 天有效期
      await this.redisService.set(redisKey, 1, redisExpireTime); // 更新版本号
      // 返回结果
      return {
        token: accessToken,
        refresh_token: refreshToken,
        tokenExpireTime: now + 3600
      };
    } catch (error: any) {
      this.logger.error(error)
      throw error
    }
  }

  /**
   * @Author: wintsa
   * @Date: 2025-01-27 
   * @LastEditors: wintsa
   * @Description: 生产新的 refresh_token和token
   * @returns {*} 
   */
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    // 从 Redis 中获取存储的版本信息

    // 验证 refresh_token 是否有效
    let payload;
    let userInfo
    try {
      payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_refreshSECRET || 'wintsa_refresh' });
       userInfo = await this.pgService.user.findUnique({
        select: {      
          phone: true,
          email: true,
        },
        where: { id: payload.sub },  // 根据 sub（用户 ID）查询用户
      });
  
    } catch (error) {
      console.log(error, 'error')

      throw new UnauthorizedException('Invalid refresh token');
    }

    const { sub: userId, version } = payload;

    // 获取 Redis 中的用户版本号
    const redisKey = `user:${userId}:version`; // Redis key 为 用户 ID + 版本号
    const storedVersion = await this.redisService.get(redisKey);
    if (storedVersion && storedVersion < version 
    ) {
      throw new UnauthorizedException('Refresh token version mismatch');
    }
    const newPayload = { sub: userId, key: !!userInfo.phone  ? `phone:${userInfo.phone}` : `email:${userInfo.email}` };
    const accessToken = await this.jwtService.sign(newPayload);

    const newVersion = version + 1;  // 增加版本号
    const refreshPayload = { sub: userId, version: newVersion };
    const newRefreshToken = await this.jwtService.sign(
      refreshPayload, { secret: process.env.JWT_refreshSECRET || 'wintsa_refresh', expiresIn: '7d' }
    );

    // 计算 token 的生效时间和过期时间
    const now = Math.floor(Date.now() / 1000); // 当前时间（秒）

    const redisExpireTime = now + 7 * 24 * 60 * 60; // 设置为 7 天有效期
    await this.redisService.set(redisKey, newVersion, redisExpireTime); // 更新版本号
    // 返回结果
    return {
      token: accessToken,
      refresh_token: newRefreshToken,
      tokenExpireTime: now + 3600
    };
  }
  /**
   * @Author: wintsa
   * @Date: 2025-01-31 
   * @LastEditors: wintsa
   * @Description: 清空用户token
   * @returns {*} 
   */
  async logout(user) {
    // 清除 Redis 中的用户版本号
    const redisKey = `user:${user.id}:version`; // Redis key 为 用户 ID + 版本号
    await this.redisService.del(redisKey);
  }
  async test() {

  }
}
