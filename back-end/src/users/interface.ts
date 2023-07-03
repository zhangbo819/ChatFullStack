import { CommonResponse } from 'src/interface';

export interface User {
  id: string;
  name: string;
  avatar: string;
  friends: string[];
  online: 1 | 0;
  //  createAt: 1687939161229,
  //  updateAt: 1687939161229,
}

export interface Group {
  id: string;
  name: string;
  owner: string;
  member: string[];
  //  createAt: 1687939161229,
  //  updateAt: 1687939161229,
}

export interface GetUserInfoByIdParams {
  id: string;
}

// 通过 id 获取群详情
// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace GetGroupInfoById {
  type params = { id: string };
  type res = CommonResponse<{
    name: string;
    id: string;
    owner: string;
    memberList: { name: string; id: string; avatar: string }[];
  }>;
}
