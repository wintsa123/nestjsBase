import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/plugin/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(    private pgService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'wintsa',
    });
  }

  async validate(payload: any) {
    const { key, sub } = payload;
    const user = await this.pgService.user.findUnique({
      where: { id: sub },  // 根据 sub（用户 ID）查询用户
    });

    if (!user) {
      throw new Error('User not found');
    }
    let isValid = false;
    if (key.startsWith('phone:')) {
      const phone = key.replace('phone:', '');
      isValid = user.phone === phone;
    } else if (key.startsWith('email:')) {
      const email = key.replace('email:', '');
      isValid = user.email === email;
    }
    if (!isValid) {
      throw new Error('Invalid key');
    }
    return { userId: sub, key: key };
  }
}
