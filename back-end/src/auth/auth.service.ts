import {
  Inject,
  Injectable,
  // UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from 'src/users/users.service';
import { RootCode, root } from 'src/interface';
import { genBase64ImageByName } from 'src/utils';
import { OnlineStatus } from 'src/users/users.entity';
import { FriendshipsService } from 'src/friendships/friendships.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => FriendshipsService))
    private friendshipsService: FriendshipsService,
  ) {}

  // // 检查用户是否登录
  // checkLogin(headers: Record<string, any>) {
  //   let errcode = 0;
  //   let message = '';
  //   const authorization = decodeURIComponent(
  //     headers.Authorization || headers.authorization || '',
  //   );
  //   const user_ids = this.usersService.getOnlineUserIds();
  //   // console.log('checkLogin user_ids', user_ids);
  //   if (!authorization || !user_ids.includes(authorization)) {
  //     errcode = 401;
  //     message = '用户未登录';
  //   }
  //   return { errcode, message, data: [] };
  // }

  // 登录
  async userLogin(data: API_AUTH.Login['params']) {
    const { userName } = data;

    const table_user = await this.usersService.getTableUser();
    const defaultData = { id: '', name: '', avatar: '', access_token: '' };

    const rootUser = await this.usersService.findOne(root);
    if (userName === rootUser.name) {
      // root
      if (data.rootCode !== RootCode) {
        return {
          errcode: 402,
          message: 'root 用户不可登录',
          data: defaultData,
        };
      }
      // else {
      //   const access_token = await this.jwtService.signAsync({
      //     username: userName,
      //     sub: rootUser.id,
      //   });

      //   return {
      //     errcode: 0,
      //     message: '成功',
      //     data: {
      //       id: rootUser.id,
      //       name: rootUser.name,
      //       avatar: rootUser.avatar,
      //       access_token,
      //     },
      //   };
      // }
    }

    let userData = table_user.find((i) => i.name === userName);

    if (userData && userData.online === OnlineStatus.ONLINE) {
      if (userData.uuid !== root) {
        return { errcode: 402, message: '用户已登录', data: defaultData };
      }
    }

    if (!userData) {
      // 注册
      const uuid = v4(userName);
      //   this.table_user.push(userData);
      userData = await this.usersService.add({
        uuid,
        name: userName,
        online: OnlineStatus.ONLINE,
        avatar: genBase64ImageByName(userName),
      });

      // 新用户自动加 root 用户好友
      const rootUser = await this.usersService.findOne(root);
      this.friendshipsService.addFriend(uuid, rootUser.uuid);
    } else {
      // 切换为上线
      await this.usersService.update(userData.uuid, {
        online: OnlineStatus.ONLINE,
      });
    }

    const access_token = await this.jwtService.signAsync({
      username: userName,
      id: userData.uuid,
    });

    const { avatar, ...log } = userData;

    console.log('登录成功', log, avatar.slice(0, 20));

    return {
      errcode: 0,
      message: '成功',
      data: {
        id: userData.uuid,
        name: userData.name,
        avatar: userData.avatar,
        access_token,
      },
    };
  }

  // 退出登录
  async loginOut(userid: string) {
    // console.log('loginOut in', userid);
    // this.users = this.users.filter((i) => i !== userid || i === root);
    const target_user = await this.usersService.findOne(userid);
    if (!target_user) {
      // throw new UnauthorizedException();
      console.log('loginOut err ', userid, '不存在');
      return;
    }

    if (userid !== root) {
      await this.usersService.update(userid, { online: 0 });
    }

    return { errcode: 0, message: '成功', data: [] };
  }

  // 查询一个用户是否在线
  public async selectUserOnline(userid: string) {
    const target_user = await this.usersService.findOne(userid);
    return target_user.online === 1;
  }
}
