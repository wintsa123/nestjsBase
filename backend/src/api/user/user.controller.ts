import { UseInterceptors,Controller, Post, Body, UseGuards, Request, ClassSerializerInterceptor, Req } from '@nestjs/common';
import { userService } from './user.service';
import { user } from './dto/user.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

// import { LocalAuthGuard } from './local-auth.guard';
@ApiTags('user')
@Controller('auth')
export class AuthController {
  constructor(private authService: userService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: Request|any) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(
    @Body() registerData: user
  ) {
    return this.authService.register(registerData);
  }


  @Post('test')
  async test(
    @Body() registerData: user
  ) {
    return this.authService.findOne(registerData);
  }
}
