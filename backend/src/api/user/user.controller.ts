import { UseInterceptors, Controller, Post, Body, UseGuards, Request, ClassSerializerInterceptor, Req } from '@nestjs/common';
import { userService } from './user.service';
import { user } from './dto/user.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '@src/decorators/Public';

// import { LocalAuthGuard } from './local-auth.guard';
@ApiTags('user')
@Controller('user')
export class AuthController {
  constructor(private authService: userService) { }
  @Public() // 跳过控制器级别的验证
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiBody({
    description: '用户名和密码用于用户登录',
    type: user,  // 指定请求体结构
  })
  async login(@Req() req: Request | any) {
    console.log(req.user)
    return this.authService.login(req.user);
  }

  @Public() // 跳过控制器级别的验证
  @Post('register')

  async register(
    @Body() registerData: user
  ) {
    return this.authService.register(registerData);
  }

  @Public() // 跳过控制器级别的验证
  @Post('refresh')
  // @ApiBody({
  //   description: '更新token',
  // })
  async refresh(@Body() refreshToken: string) {
     return this.authService.refresh(refreshToken);
  }
  @Post('test')
  @ApiBearerAuth('JWT-auth') // 与 main.ts 中定义的安全方案名称一致

  async test(
    @Req() req: Request | any
  ) {
    const user = req.user;
    return user;
  }
}
