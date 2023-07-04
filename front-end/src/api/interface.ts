import { DataType } from "@/pages/Chat/interface";

export interface CommonResponse<T = any> {
  errcode: number;
  message?: string;
  data: T;
}

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

// 消息 map
export type message_item = {
  count: number;
  lastMsg: string;
  time: number | string;
  // isGroup: boolean;
  // avatar: string
};

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

// 获取用户列表
export declare namespace GetUserList {
  type Users = { id: string; name: string; avatar: string; online?: 1 | 0 }[];
  type params = {
    userid: string | null;
  };
  type res = CommonResponse<Users>;
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

// 通过 id 获取群详情
export declare namespace GetGroupInfoById {
  type GroupInfo = {
    name: string;
    id: string;
    owner: string;
    memberList: { name: string; id: string; avatar: string }[];
  };
  type params = { id: string };
  type res = CommonResponse<GroupInfo>;
}

// 添加群成员
export declare namespace AddGroupMember {
  type params = { groupId: string; userIds: string[] };
  type res = CommonResponse<boolean>;
}
