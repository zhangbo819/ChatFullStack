import axiosCommon from "axios";
import { showFailToast, showLoadingToast, closeToast } from "vant";
import {
  AddGroupMember,
  CommonResponse,
  GetGroupInfoById,
  GetMessageList,
  GetUserInfoByIdParams,
  GetUserList,
  Login,
  createGroupParams,
  createGroupRes,
  getChatListParams,
  getUserInfo,
  sendMessageParams,
} from "./interface";
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

// 获取个人聊天记录
export function apiGetChatList(params: getChatListParams) {
  return axios.get("/getChatList", { params });
}

// 发送信息
export function apiPostMessage(data: sendMessageParams) {
  return axios.post<sendMessageParams>("/postMessage", data, { timeout: 2000 });
}

// 获取消息列表
export function apiGetMessageList(params: GetMessageList.params) {
  return axios.get<GetMessageList.params, GetMessageList.res>(
    "/getMessageList",
    {
      params,
    }
  );
}

// 获取用户列表
export function apiGetUserList(params: GetUserList.params) {
  return axios.get<GetUserList.params, GetUserList.res>("/getUserList", {
    params,
  });
}

// 用户登录
export function apiUserLogin(data: Login.params) {
  return axios.post<Login.params, Login.res>("/userLogin", data);
}

// 退出登录
export function apiLoginOut(data: { userid: string | null }) {
  return axios.post("/loginOut", data);
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
export function apiAddFriend(params: GetUserList.params) {
  return axios.get("/addFriend", { params });
}

// 创建群聊
export function apiCreateGroup(params: createGroupParams) {
  return axios.post<createGroupParams, createGroupRes>("/createGroup", params);
}

// 通过 id 获取群详情
export function apiGetGroupInfoById(params: GetGroupInfoById.params) {
  return axios.get<GetGroupInfoById.params, GetGroupInfoById.res>(
    "/user/getGroupInfoById",
    { params }
  );
}

// TODO 为群聊添加成员
export function apiAddGroupMember(params: AddGroupMember.params) {
  return axios.post<createGroupParams, AddGroupMember.res>(
    "/addGroupMember",
    params
  );
}
