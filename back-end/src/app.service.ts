import { Injectable } from '@nestjs/common';
import {
  DataType,
  getChatListParams,
  // local,
  // remote,
  root,
  sendMessageParams,
} from './interface';

@Injectable()
export class AppService {
  // { time: 1686799994400, msg: 'hello local', form: remote },
  // { time: 1686799984400, msg: 'hello remote', form: local },
  private readonly data = {
    zzb: {},
  };

  // private users = [root];

  // private user_friends = {
  //   [root]: [],
  // };

  getList(params: getChatListParams): DataType[] {
    const { to, form, time } = params;
    // console.log('to, form', to, form);
    console.log('this.data', JSON.stringify(this.data, null, 4));
    return this.data[form]?.[to] || [];
  }

  private saveChat(form: string, to: string, data: any): void {
    if (typeof this.data[form] == 'undefined') {
      this.data[form] = { [to]: [] };
    }

    if (!Array.isArray(this.data[form][to])) {
      this.data[form][to] = [];
    }

    this.data[form][to].push(...data);
  }

  postMessage(params: sendMessageParams): null {
    const { to, form, addData } = params;

    this.saveChat(to, form, addData);
    this.saveChat(form, to, addData);

    return null;
  }

  getUserList(Param) {
    // TODO
    return [root];
  }
}

// const map = {
//   'zzb-zh': [
//     { time: 0, msg: 'hello zzb', from: 'zh' },
//     { time: 1, msg: 'hello zh', from: 'zzb' },
//   ],
//   'zzb-ddd': [],
//   'ddd-zh': [],
// };

// const da = {
//   zzb: {
//     zh: map['zzb-zh'],
//     dd: [],
//   },
//   zh: {
//     zzb: map['zh-zzb'],
//     dd: [],
//   },
//   ddd: {
//     zzb: [],
//     zh: [],
//   },
// };

// console.log(da);
