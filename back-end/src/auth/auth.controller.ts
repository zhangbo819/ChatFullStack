import { Body, Controller, Post } from '@nestjs/common';
import { User } from 'src/users/interface';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 登录
  @Post('userLogin')
  async userLogin(
    @Body() data: { userName: string; rootCode?: string },
  ): Promise<CommonResponse<Partial<User>>> {
    return await this.authService.userLogin(data);
  }

  // 退出登录
  @Post('loginOut')
  async loginOut(@Body() data: { userid: string }): Promise<CommonResponse> {
    return await this.authService.loginOut(data.userid);
  }
}
