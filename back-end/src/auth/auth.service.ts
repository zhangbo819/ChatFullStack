import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { UsersService } from 'src/users/users.service';
import { RootCode, root } from 'src/interface';
import { genBase64ImageByName } from 'src/utils';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  // 检查用户是否登录
  checkLogin(headers: Record<string, any>) {
    let errcode = 0;
    let message = '';
    const authorization = decodeURIComponent(
      headers.Authorization || headers.authorization || '',
    );
    const user_ids = this.usersService.getOnlineUserIds();
    // console.log('checkLogin user_ids', user_ids);
    if (!authorization || !user_ids.includes(authorization)) {
      errcode = 401;
      message = '用户未登录';
    }
    return { errcode, message, data: [] };
  }

  // 登录
  async userLogin(data: { userName: string; rootCode?: string }) {
    const { userName } = data;

    const table_user = this.usersService.getTableUser();
    const defaultData = {};

    const rootUser = await this.usersService.findOne(root);
    if (userName === rootUser.name) {
      // root
      if (data.rootCode !== RootCode) {
        return {
          errcode: 402,
          message: 'root 用户不可登录',
          data: defaultData,
        };
      } else {
        return { errcode: 0, message: '成功', data: { id: root, name: 'zzb' } };
      }
    }

    let userData = table_user.find((i) => i.name === userName);

    if (userData && userData.online === 1) {
      return { errcode: 402, message: '用户已登录', data: defaultData };
    }

    if (!userData) {
      const id = v4(userName);
      //   this.table_user.push(userData);
      userData = await this.usersService.add({
        id,
        name: userName,
        friends: [root],
        online: 1,
        avatar: genBase64ImageByName(userName),
      });
      const rootUser = await this.usersService.findOne(root);
      rootUser.friends.push(id);
    } else {
      await this.usersService.update(userData.id, { online: 1 });
    }

    const { avatar, ...log } = userData;

    console.log('登录成功', log, avatar.slice(0, 20));

    return {
      errcode: 0,
      message: '成功',
      data: { id: userData.id, name: userData.name, avatar: userData.avatar },
    };
  }

  // 退出登录
  async loginOut(userid: string) {
    // this.users = this.users.filter((i) => i !== userid || i === root);
    const target_user = await this.usersService.findOne(userid);
    if (!target_user) {
      return { errcode: 401, mesaage: '用户不存在，请重新登录', data: [] };
    }

    if (userid !== root) {
      await this.usersService.update(userid, { online: 0 });
    }

    return { errcode: 0, message: '成功', data: [] };
  }
}
