interface CommonResponse<T = any> {
  errcode: number;
  message?: string;
  data: T;
}

// 用户
declare namespace API_USER {
  // 获取用户列表
  interface GetUserList {
    Users: { id: string; name: string; avatar: string; online?: 1 | 0 };
    params: {
      userid: string | null;
    };
    res: CommonResponse<GetUserList['Users'][]>;
  }
  // 添加群成员
  interface AddGroupMember {
    params: { groupId: string; userIds: string[] };
    res: CommonResponse<boolean>;
  }
  // 通过 id 获取群详情
  interface GetGroupInfoById {
    params: { id: string };
    res: CommonResponse<{
      name: string;
      id: string;
      owner: string;
      memberList: { name: string; id: string; avatar: string }[];
    }>;
  }
}

// 消息
declare namespace API_CHAT {
  // 消息 map
  type message_item = {
    count: number;
    lastMsg: string;
    time: number | string;
    // isGroup: boolean;
    // avatar: string
  };
  interface resItem extends message_item {
    id: string;
    name: string;
    avatar: string;
    isGroup: number; // 1 | 0
  }
  // 获取消息列表
  interface GetMessageList {
    // 新版
    params: { id: string };
    resData: resItem[];
    resItem: resItem;
    res: CommonResponse<resItem[]>;
  }
  // 读消息
  interface ReadMessage {
    params: {
      userid: string;
      targetId: string;
    };

    res: CommonResponse<string>;
  }
}
