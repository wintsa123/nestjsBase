import { Injectable } from '@nestjs/common';
import { userService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: userService) { }

  async validateUser(phone: number, email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne({ phone, email });

    if (!user) {
      throw '用户不存在';

    }
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    throw '密码不正确';
  }
}
