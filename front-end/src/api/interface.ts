import { DataType } from "@/pages/Chat/interface";

export interface CommonResponse<T = any> {
  errcode: number;
  message?: string;
  data: T;
}

export interface User {
  id: string;
  name: string;
  friends: string[];
  online: 1 | 0;
  avatar: string;
  //  createAt: 1687939161229,
  //  updateAt: 1687939161229,
}

// 登录
export declare namespace Login {
  type params = { userName: string; rootCode: "" };
  type res = CommonResponse<User>;
}

// 获取用户信息
export declare namespace getUserInfo {
  type res = CommonResponse<User>;
}

// 获取聊天信息
export interface getChatListParams {
  form: string;
  to: string;
  isGroup: "1" | "0";
  // time: number;
}

// 发送消息
export interface sendMessageParams {
  form: string;
  to: string;
  isGroup: "1" | "0";
  addData: DataType[];
}

// 获取用户列表 参数
export interface getUserListParams {
  userid: string | null;
}
// 获取用户列表 返回
export type getUserListRes = CommonResponse<{ id: string; name: string }[]>;

// 新建群聊 参数
export interface createGroupParams {
  userid: string;
  name: string;
}
// 新建群聊 返回
export type createGroupRes = CommonResponse<{
  id: string;
  name: string;
}>;

// 添加群成员
export declare namespace AddGroupMember {
  type params = { groupId: string; userIds: string[] };
  type res = CommonResponse<boolean>;
}
