import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { userService } from './user.service';
import { AuthController } from './user.controller';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';


@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'wintsa',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [userService,LocalStrategy,JwtStrategy],
  controllers: [AuthController],
  exports: [userService],
})
export class userModule {}
