import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/pubilc.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 登录
  @Public()
  @Post('userLogin')
  async userLogin(
    @Body() data: API_AUTH.Login['params'],
  ): Promise<API_AUTH.Login['res']> {
    return await this.authService.userLogin(data);
  }

  // 退出登录
  @Post('loginOut')
  async loginOut(
    @Body() data: API_AUTH.LoginOut['params'],
  ): Promise<API_AUTH.LoginOut['res']> {
    return await this.authService.loginOut(data.userid);
  }
}
