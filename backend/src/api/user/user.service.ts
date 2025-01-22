import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { user } from './dto/user.dto';

@Injectable()
export class userService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) { }



  async findOne(userData: { phone?: number | null; email?: string | null }) {
    const whereConditions: any = [];

    // 检查并添加有效的phone条件
    if (userData.phone != null) {
      whereConditions.push({ phone: userData.phone });
    }

    // 检查并添加有效的email条件
    if (userData.email != null) {
      whereConditions.push({ email: userData.email });
    }

    // 确保至少有一个条件
    if (whereConditions.length === 0) {
      throw '必须提供 phone 或 email 其中一项'
    }

    // 执行查询（OR 条件）
    return await this.usersRepository.findOne({
      where: whereConditions
    });
  }

  async validateUser(phone: number, email: string, password: string): Promise<any> {
    const user = await this.findOne({ phone, email });

    if (!user) {
      throw '用户不存在';

    }
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    } else {
      throw '密码不正确';

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
    // 检查手机号是否已注册
    if (userData.phone) {
      const existingUserByPhone = await this.usersRepository.findOne({
        where: { phone: userData.phone },
      });
      if (existingUserByPhone) {
        throw new UnauthorizedException('该手机已被注册');
      }
    }

    // 检查邮箱是否已注册
    if (userData.email) {
      const existingUserByEmail = await this.usersRepository.findOne({
        where: { email: userData.email },
      });
      if (existingUserByEmail) {
        throw new UnauthorizedException('该邮箱已被注册');
      }
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // 创建用户
    const user = new UserEntity({
      ...userData,
      password: hashedPassword,
    });

    // 保存用户
    const savedUser = await this.usersRepository.save(user);

    // 生成 access_token
    const TokenPayload = {
      sub: savedUser.id, key: savedUser.phone ? `phone:${savedUser.phone}` : `email:${savedUser.email}`
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
}
