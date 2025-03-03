import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/plugin/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private pgService: PrismaService,
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
      select: {
        realname: true,
        role: true,
        phone: true,
        email: true,
        sex: true,
        lat: true,
        lng: true,
        address: true

      },
      where: { id: sub },  // 根据 sub（用户 ID）查询用户
    });

    if (!user) {
      throw new Error('User not found');
    }
    let isValid = false;

    if (key.startsWith('phone:')) {
      const phone = key.replace('phone:', '');
      isValid = user.phone == phone;
    } else if (key.startsWith('email:')) {
      const email = key.replace('email:', '');
      isValid = user.email == email;
    }
    if (!isValid) {
      throw new Error('Invalid key');
    }
    const userInfo={ userId: sub, key: key, ...user }

    return userInfo;
  }
}
