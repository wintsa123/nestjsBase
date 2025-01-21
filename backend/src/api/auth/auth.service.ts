import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) { }

  async validateUser(phone: number, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { phone } });
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { phone: user.phone, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
      },
    };
  }

  async register(userData: { phone: number; password: string; email: string }) {

    if (userData.phone) {
     let existingUser = await this.usersRepository.findOne({
        where: [
          { phone: userData.phone },
        ],
      });
      if (existingUser) {
        throw new UnauthorizedException('该手机已被注册');
      }
    }
    if (userData.email) {
      let existingUser = await this.usersRepository.findOne({
        where: [
          { email: userData.email },
        ],
      });
      if (existingUser) {
        throw new UnauthorizedException('该邮箱已被注册');
      }
    }

   

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });
    // console.log(use)
    console.log(user)
    throw ''
    const savedUser = await this.usersRepository.save(user);
    const { ...result } = savedUser;
    return result;
  }
}
