// import { CommonResponse, message_item } from 'src/interface';
// import { Group, User } from 'src/users/interface';

import { CommonResponse, message_item } from "./interface";

// 获取消息列表
// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace GetMessageList {
  // interface GroupMessage extends Group {
  //   isGroup: number; // 1 | 0
  // }
  // interface UserMessage extends Pick<User, 'id' | 'name' | 'avatar'> {
  //   isGroup: number;
  // }
  // 新版
  type params = {
    id: string;
  };
  interface resItem extends message_item {
    id: string;
    name: string;
    avatar: string;
    isGroup: number | string; // 1 | 0
  }
  type resData = resItem[];
  type res = CommonResponse<resItem[]>;
}

// 读消息
// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace ReadMessage {
  type params = {
    userid: string;
    targetId: string;
  };

  type res = CommonResponse<string>;
}
