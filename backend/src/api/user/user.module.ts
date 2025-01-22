import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { userService } from './user.service';
import { AuthController } from './user.controller';
// import { JwtStrategy } from './jwt.strategy';
// import { LocalStrategy } from './local.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'wintsa',
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [userService],
  controllers: [AuthController],
  exports: [userService],
})
export class userModule {}
