import { UseInterceptors,Controller, Post, Body, UseGuards, Request, ClassSerializerInterceptor, Req } from '@nestjs/common';
import { userService } from './user.service';
import { user } from './dto/user.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '@src/decorators/Public';

// import { LocalAuthGuard } from './local-auth.guard';
@ApiTags('user')
@Controller('auth')
export class AuthController {
  constructor(private authService: userService) {}
  @Public() // 跳过控制器级别的验证
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: Request|any) {
    return this.authService.login(req.user);
  }
  @Public() // 跳过控制器级别的验证
  @Post('register')
  async register(
    @Body() registerData: user
  ) {
    return this.authService.register(registerData);
  }


  @Post('test')
  @Public() // 跳过控制器级别的验证

  async test(
    @Body() registerData: user
  ) {
    return this.authService.findOne(registerData);
  }
}
