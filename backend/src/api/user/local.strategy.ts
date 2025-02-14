import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { userService } from './user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userClass: userService) {
        super({
            usernameField: 'phone', // 默认字段
            passwordField: 'password',
            passReqToCallback: true, // 允许传递 req 对象
        });
    }

    async validate(req: Request, phone: string, password: string): Promise<any> {
       
        const {  email }: any = req.body;

        const user = await this.userClass.validateUser(phone, email, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
