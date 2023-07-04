import { CommonResponse } from 'src/interface';
import { Group, User } from 'src/users/interface';

// 获取消息列表
// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace GetMessageList {
  interface GroupMessage extends Group {
    isGroup: number; // 1 | 0
  }
  interface UserMessage extends Pick<User, 'id' | 'name' | 'avatar'> {
    isGroup: number;
  }
  type params = {
    id: string;
  };
  type resData = UserMessage[] | GroupMessage[];
  type res = CommonResponse<resData>;
}
