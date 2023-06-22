import { Injectable } from '@nestjs/common';
import { DataType, local, remote, root, sendMessageParams } from './interface';


@Injectable()
export class AppService {
  private readonly data: DataType[] = [
    // { time: 1686799984400, msg: 'hello remote', form: local },
    // { time: 1686799994400, msg: 'hello local', form: remote },
  ];

  private users = [root];

  private user_friends = {
    [root]: [],
  };

  getList(): DataType[] {
    return this.data;
  }

  postMessage(params: sendMessageParams): null {
    const { addData } = params;

    this.data.push(...addData);

    return null;
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
