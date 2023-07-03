import { Controller, Get, Headers } from '@nestjs/common';
import { CommonResponse } from '../interface';
import { UsersService } from './users.service';
import { User } from './interface';

@Controller('user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  // 某个人用户信息
  @Get('getUserInfo')
  async getList(
    @Headers() headers: any,
    // @Query() Query: getChatListParams,
  ): Promise<CommonResponse<Partial<User> | undefined>> {
    const err = this.usersService.checkLogin(headers);
    if (err.errcode !== 0) return { ...err, data: undefined };
    const userid = decodeURIComponent(
      headers.Authorization || headers.authorization || '',
    );

    const data = await this.usersService.findOne(userid);

    return {
      errcode: 0,
      data: { name: data.name, id: data.id, avatar: data.avatar },
    };
  }
}
