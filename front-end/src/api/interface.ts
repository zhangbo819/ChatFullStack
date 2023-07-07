import { DataType } from "@/pages/Chat/interface";

export interface User {
  id: string;
  name: string;
  avatar: string;
  friends: string[];
  online: 1 | 0;
  //  createAt: 1687939161229,
  //  updateAt: 1687939161229,
}

interface Group {
  id: string;
  name: string;
  owner: string;
  avatar: string;
  member: string[];
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
export interface GetUserInfoByIdParams {
  id: string;
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