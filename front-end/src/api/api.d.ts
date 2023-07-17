interface CommonResponse<T = any> {
  errcode: number;
  message?: string;
  data: T;
}

// 认证
declare namespace API_AUTH {
  // 登录、注册
  interface Login {
    params: { userName: string; rootCode: "" };
    userInfo: {
      access_token: string;
      id: string;
      avatar: string;
      name: string;
    }
    res: CommonResponse<Login['userInfo']>;
  }

  interface LoginOut {
    params: { userid: string | null };
    res: CommonResponse;
  }
}

// 用户
declare namespace API_USER {
  // 获取用户信息
  interface getUserInfo {
    res: CommonResponse<User>;
  }
  // 获取指定id的用户信息
  interface GetUserInfoById {
    params: {
      id: string;
    };
    res: getUserInfo["res"];
  }
  // 获取用户列表
  interface GetUserList {
    Users: { id: string; name: string; avatar: string; online?: 1 | 0 };
    params: {
      userid: string | null;
    };
    res: CommonResponse<GetUserList["Users"][]>;
  }
  // 更换头像
  interface ChangeAvatar {
    data: {
      url: string;
    };
    res: CommonResponse<boolean>;
  }

  // 群
  // 新建群聊
  interface createGroup {
    params: { userid: string; name: string; members: string[] };
    res: CommonResponse<{
      id: string;
      name: string;
    }>;
  }
  // 添加群成员
  interface AddGroupMember {
    params: { groupId: string; userIds: string[] };
    res: CommonResponse<boolean>;
  }
  // 通过 id 获取群详情
  interface GetGroupInfoById {
    params: { id: string };
    GroupInfo: {
      name: string;
      id: string;
      owner: string;
      memberList: { name: string; id: string; avatar: string }[];
    };
    res: CommonResponse<GetGroupInfoById["GroupInfo"]>;
  }
}

// 消息
declare namespace API_CHAT {
  // 消息 item
  interface DataType {
    time: string | number;
    msg: string;
    form: string;
  }
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

  // 获取聊天信息
  interface getChatList {
    params: {
      form: string;
      to: string;
      isGroup: "1" | "0";
      // time: number;
    };
    res: CommonResponse<DataType[]>;
  }

  // 发送消息
  interface sendMessage {
    params: {
      form: string;
      to: string;
      isGroup: "1" | "0";
      addData: DataType[];
    };
  }
}
