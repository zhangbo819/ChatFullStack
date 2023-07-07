import axiosCommon from "axios";
import { showFailToast, showLoadingToast, closeToast } from "vant";
import router from "@/router";
import {
  GetUserInfoByIdParams,
  Login,
  createGroupParams,
  createGroupRes,
  getChatListParams,
  getUserInfo,
  sendMessageParams,
} from "./interface";

const axios = axiosCommon.create({
  baseURL: "/api",
});

axios.interceptors.request.use((config) => {
  // console.log('config', config)
  config.headers = {
    // accept: 'application/json',
    // 'Content-Type': 'application/json',
    // 'Cache-Control': 'no-cache',
    Authorization: encodeURIComponent(localStorage.getItem("token") || ""), // 解决 headers 中不能有汉字，请求发不出去
    ...(config.headers as any),
  };

  // console.log('config', config)
  // console.log('config.headers', config.headers)

  return config;
});

axios.interceptors.response.use((res) => {
  const { data } = res;
  if (data.errcode === 0) {
    return data;
  } else if (data.errcode === 401) {
    showLoadingToast({
      message: "请登录",
      duration: 0,
      forbidClick: true,
    });

    setTimeout(() => {
      closeToast();
      router.replace("/login");
    }, 1000);
    return data;
  } else {
    showFailToast({
      message: data.message,
    });
    throw new Error(data.message);
  }
});

// 认证
// 用户登录
export function apiUserLogin(data: Login.params) {
  return axios.post<Login.params, Login.res>("/auth/userLogin", data);
}

// 退出登录
export function apiLoginOut(data: { userid: string | null }) {
  return axios.post("/auth/loginOut", data);
}

// 聊天
// 获取个人聊天记录
export function apiGetChatList(params: getChatListParams) {
  return axios.get("/chat/getChatList", { params });
}

// 发送信息
export function apiPostMessage(data: sendMessageParams) {
  return axios.post<sendMessageParams>("/chat/postMessage", data, { timeout: 2000 });
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
// 获取用户列表
export function apiGetUserList(params: API_USER.GetUserList["params"]) {
  return axios.get<API_USER.GetUserList["params"], API_USER.GetUserList["res"]>(
    "/user/getUserList",
    {
      params,
    }
  );
}

// root 强制让某个用户下线，来解决 token 被清除后 用户一直在线的问题
export function apiPutUserLoginout(params: { id: string }) {
  return axios.get<{ id: string }, CommonResponse<boolean>>(
    "/user/putUserLoginout",
    { params }
  );
}
// 通过 token 获取用户信息
export function apiGetUserInfo() {
  return axios.get<undefined, getUserInfo.res>("/user/getUserInfo");
}

// 获取指定 id 的用户信息
export function apiGetUserInfoById(params: GetUserInfoByIdParams) {
  return axios.get<GetUserInfoByIdParams, getUserInfo.res>(
    "/user/getUserInfoById",
    {
      params,
    }
  );
}

// 添加好友
export function apiAddFriend(params: API_USER.GetUserList["params"]) {
  return axios.get("/user/addFriend", { params });
}

// 创建群聊
export function apiCreateGroup(params: createGroupParams) {
  return axios.post<createGroupParams, createGroupRes>(
    "/user/createGroup",
    params
  );
}

// 通过 id 获取群详情
export function apiGetGroupInfoById(
  params: API_USER.GetGroupInfoById["params"]
) {
  return axios.get<
    API_USER.GetGroupInfoById["params"],
    API_USER.GetGroupInfoById["res"]
  >("/user/getGroupInfoById", { params });
}

// TODO 为群聊添加成员
export function apiAddGroupMember(params: API_USER.AddGroupMember["params"]) {
  return axios.post<
    API_USER.AddGroupMember["params"],
    API_USER.AddGroupMember["res"]
  >("/user/addGroupMember", params);
}
