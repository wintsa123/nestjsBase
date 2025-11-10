import { UseInterceptors, Controller, Post, Body, UseGuards, Request, ClassSerializerInterceptor, Req, Res, Get, UnauthorizedException } from '@nestjs/common';
import { userService } from './user.service';
import { user } from './dto/user.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '@src/decorators/Public';
import { register } from './dto/register.dto';

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
  async login(@Req() req: Request | any, @Res({ passthrough: true }) _res) {
    return await this.authService.login(req.user);

    // _res.setCookie('refresh_token', refresh_token, {
    //   httpOnly: false,
    //   secure: false,
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    //   sameSite: 'none',
    //   domain: 'localhost:5173',
    //   path: '/',
    // });
  }

  @Public() // 跳过控制器级别的验证
  @Post('register')

  async register(
    @Body() registerData: register
  ) {
    return this.authService.register(registerData);
  }

  @Public() // 跳过控制器级别的验证
  @Post('refresh')
  async refresh(@Body() data: { refreshToken: string }) {
    // const cookies = request.cookies; // 获取所有 Cookie
    if (!data.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    // const refreshTokenFromCookie = cookies['refreshToken']; // 获取指定的 Cookie（假设你用的是 `refreshToken` 作为 Cookie 的键名）
    return this.authService.refresh(data.refreshToken);
  }
  @Post('test')
  @ApiBearerAuth('JWT-auth') // 与 main.ts 中定义的安全方案名称一致
  async test(
    @Req() req: Request | any
  ) {
    const user = req.user;
    return user;
  }
  @Post('logout')
  @ApiBearerAuth('JWT-auth') // 与 main.ts 中定义的安全方案名称一致
  async logout(
    @Req() req: Request | any
  ) {
    const user = req.user;
    return this.authService.logout(user);
  }
  @Get('userInfo')
  @ApiBearerAuth('JWT-auth') // 与 main.ts 中定义的安全方案名称一致
  async userInfo(
    @Req() req: Request | any
  ) {
    if (!req.user) {
      throw '请先登录'
    }
    const { userId, key, ...userWithoutPassword } = req.user;
    return { ...userWithoutPassword };
  }
}
