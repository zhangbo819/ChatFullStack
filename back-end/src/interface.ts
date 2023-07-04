// export const local = 'local';
// export const remote = 'remote';
// export const root = 'zzb';
export const root = '3295d1ab-bc27-416b-9c16-112a0a634eca';
export const RootCode = _getRandomCode(); // TODO 其他方式优化下
console.log('RootCode', RootCode);

export interface CommonResponse<T = any> {
  errcode: number;
  message?: string;
  data: T;
}

export interface DataType {
  time: string | number;
  msg: string;
  form: string;
}

// 获取聊天信息
export interface getChatListParams {
  form: string;
  to: string;
  isGroup: '1' | '0';
  // time: number;
}

// 发送消息
export interface sendMessageParams {
  form: string;
  to: string;
  isGroup: '1' | '0';
  addData: DataType[];
}

// 获取用户列表
// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace GetUserList {
  type Users = { id: string; name: string; avatar: string; online?: 1 | 0 };
  type params = {
    userid: string | null;
  };
  type res = CommonResponse<Users[]>;
}

// 群聊
// 新建群聊 参数
export interface createGroupParams {
  userid: string;
  name: string;
  members: string[];
}
// 新建群聊 返回
export type createGroupRes = CommonResponse<{
  id: string;
  name: string;
}>;

// 添加群成员
// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace AddGroupMember {
  type params = { groupId: string; userIds: string[] };
  type res = CommonResponse<boolean>;
}

// export interface table_user_item {
//   id: string;
//   name: string;
//   friends: string[];
//   online: 1 | 0;
//   //  createAt: 1687939161229,
//   //  updateAt: 1687939161229,
// }

export type map_chat_Type = Record<string, DataType[]>;

export type map_message_Type = Record<
  string,
  Record<
    string,
    {
      count: number;
      lastMsg: string;
      time: number | string;
      isGroup: boolean;
      // avatar: string
    }
  >
>;

function _getRandomCode() {
  const res = [];
  let i = 4;
  while (i--) {
    res.push(Math.floor(Math.random() * 10));
  }
  return res.join('');
}
