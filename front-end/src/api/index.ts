import axiosCommon from "axios";
import { showFailToast, showLoadingToast, closeToast } from "vant";
import router from "@/router";

const axios = axiosCommon.create({
  baseURL: "/api",
});

axios.interceptors.request.use((config) => {
  // console.log('config', config)
  config.headers = {
    // accept: 'application/json',
    // 'Content-Type': 'application/json',
    // 'Cache-Control': 'no-cache',
    Authorization:
      "Bearer " +
      encodeURIComponent(localStorage.getItem("access_token") || ""), // 解决 headers 中不能有汉字，请求发不出去
    ...(config.headers as any),
  };

  // console.log('config', config)
  // console.log('config.headers', config.headers)

  return config;
});

axios.interceptors.response.use(
  (res) => {
    const { data } = res;
    if (data.errcode === 0) {
      return data;
    } else {
      showFailToast({
        message: data.message,
      });
      throw new Error(data.message);
    }
    // else if (data.errcode === 401) {
    //   showLoadingToast({
    //     message: "请登录",
    //     duration: 0,
    //     forbidClick: true,
    //   });

    //   setTimeout(() => {
    //     closeToast();
    //     router.replace("/login");
    //   }, 1000);
    //   return data;
    // }
  },
  (err) => {
    // console.log("err", err);
    if (err.response.status === 401) {
      showLoadingToast({
        message: "登录信息过期，请重新登录",
        duration: 0,
        forbidClick: true,
      });

      setTimeout(() => {
        closeToast();
        router.replace("/login");
      }, 1000);
    } else {
      showFailToast({ message: err.message });
    }
  },
);

// 认证
// 用户登录
export function apiUserLogin(data: API_AUTH.Login["params"]) {
  return axios.post<API_AUTH.Login["params"], API_AUTH.Login["res"]>(
    "/auth/userLogin",
    data,
  );
}

// 退出登录
export function apiLoginOut(data: API_AUTH.LoginOut["params"]) {
  return axios.post<API_AUTH.LoginOut["params"], API_AUTH.LoginOut["res"]>(
    "/auth/loginOut",
    data,
  );
}

// 聊天
// 根据会话id获取会话成员信息
export function getConversationMemberInfos(
  params: API_CHAT.GetConversationMemberInfos["params"],
) {
  return axios.get<
    API_CHAT.GetConversationMemberInfos["params"],
    API_CHAT.GetConversationMemberInfos["res"]
  >("/chat/getConversationMemberInfos", { params });
}
// 获取个人聊天记录
export function apiGetChatList(params: API_CHAT.getChatList["params"]) {
  return axios.get<API_CHAT.getChatList["params"], API_CHAT.getChatList["res"]>(
    "/chat/getChatList",
    { params },
  );
}

// 发送信息
export function apiPostMessage(data: API_CHAT.sendMessage["params"]) {
  return axios.post<API_CHAT.sendMessage["params"]>("/chat/sendMessage", data, {
    timeout: 2000,
  });
}

// 读取信息
export function apiReadMessage(data: API_CHAT.ReadMessage["params"]) {
  return axios.post<
    API_CHAT.ReadMessage["params"],
    API_CHAT.ReadMessage["res"]
  >("/chat/readMessage", data);
}

// 获取消息列表
export function apiGetMessageList(params: API_CHAT.GetMessageList["params"]) {
  return axios.get<
    API_CHAT.GetMessageList["params"],
    API_CHAT.GetMessageList["res"]
  >("/chat/getMessageList", {
    params,
  });
}

// 用户
// 获取指定用户的好友列表
export function apiGetUserList(params: API_USER.GetUserList["params"]) {
  return axios.get<API_USER.GetUserList["params"], API_USER.GetUserList["res"]>(
    "/user/getUserList",
    {
      params,
    },
  );
}

// root 强制让某个用户下线，来解决 token 被清除后 用户一直在线的问题
export function apiPutUserLoginout(params: { id: string }) {
  return axios.get<{ id: string }, CommonResponse<boolean>>(
    "/user/putUserLoginout",
    { params },
  );
}
// 通过 token 获取用户信息
export function apiGetUserInfo() {
  return axios.get<undefined, API_USER.getUserInfo["res"]>("/user/getUserInfo");
}

// // 获取指定 id 的用户信息
// export function apiGetUserInfoById(params: API_USER.GetUserInfoById["params"]) {
//   return axios.get<
//     API_USER.GetUserInfoById["params"],
//     API_USER.GetUserInfoById["res"]
//   >("/user/getUserInfoById", {
//     params,
//   });
// }

// 为用户更换头像
export function apiChangeAva(data: API_USER.ChangeAvatar["data"]) {
  return axios.post<
    API_USER.ChangeAvatar["data"],
    API_USER.ChangeAvatar["res"]
  >("/user/changeAvatar", data);
}

// 添加好友
export function apiAddFriend(params: API_USER.AddFriend["params"]) {
  return axios.get<API_USER.AddFriend["params"], API_USER.AddFriend["res"]>(
    "/user/addFriend",
    { params },
  );
}

// 群
// 创建群聊
export function apiCreateGroup(params: API_USER.createGroup["params"]) {
  return axios.post<
    API_USER.createGroup["params"],
    API_USER.createGroup["res"]
  >("/user/createGroup", params);
}

// // 通过 id 获取群详情
// export function apiGetGroupInfoById(
//   params: API_USER.GetGroupInfoById["params"]
// ) {
//   return axios.get<
//     API_USER.GetGroupInfoById["params"],
//     API_USER.GetGroupInfoById["res"]
//   >("/user/getGroupInfoById", { params });
// }

// TODO 还未使用 为群聊添加成员
export function apiAddGroupMember(params: API_USER.AddGroupMember["params"]) {
  return axios.post<
    API_USER.AddGroupMember["params"],
    API_USER.AddGroupMember["res"]
  >("/user/addGroupMember", params);
}
