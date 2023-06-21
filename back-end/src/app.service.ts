import { Injectable } from '@nestjs/common';
import { DataType, local, remote, sendMessageParams } from './interface';

@Injectable()
export class AppService {
  private readonly data: DataType[] = [
    { time: 1686799984400, msg: 'hello remote', form: local },
    { time: 1686799994400, msg: 'hello local', form: remote },
    // {
    //   time: 1686799995400,
    //   msg: '几拿地价佛is啊就是滴飞机束带结发is觉得佛i就是扫地机佛山降低佛山街司法鉴定哦if时间',
    //   form: remote,
    // },
  ];

  getList(): { data: DataType[] } {
    return {
      data: this.data,
    };
  }

  postMessage(params: sendMessageParams): { code: number } {
    const { addData } = params;

    this.data.push(...addData);

    return {
      code: 200,
    };
  }
}
