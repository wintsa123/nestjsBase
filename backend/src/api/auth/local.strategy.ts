import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
          

            usernameField: 'phone', // 默认字段
            passwordField: 'password',
            passReqToCallback: true, // 允许传递 req 对象
        });
    }

    async validate(req: Request, phone: number, password: string): Promise<any> {
       
        const {  email }: any = req.body;

        const user = await this.authService.validateUser(phone, email, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
