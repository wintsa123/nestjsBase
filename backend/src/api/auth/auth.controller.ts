import { UseInterceptors,Controller, Post, Body, UseGuards, Request, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthService } from './auth.service';
import { user } from './dto/user.dto';
import { ApiTags } from '@nestjs/swagger';

// import { LocalAuthGuard } from './local-auth.guard';
@ApiTags('user')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() registerData: user) {
    return this.authService.login(registerData);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('register')
  async register(
    @Body() registerData: user
  ) {
    return this.authService.register(registerData);
  }
}
