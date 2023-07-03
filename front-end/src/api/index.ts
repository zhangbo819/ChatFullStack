import axiosCommon from "axios";
import { showFailToast, showLoadingToast, closeToast } from "vant";
import {
  AddGroupMember,
  Login,
  createGroupParams,
  createGroupRes,
  getChatListParams,
  getUserInfo,
  getUserListParams,
  getUserListRes,
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
      window.location.href = window.location.origin + "/login";
    }, 1000);
    return data;
  } else {
    showFailToast({
      message: data.message,
    });
    throw new Error(data.message);
  }
});

// 获取列表
export function getChatList(params: getChatListParams) {
  return axios.get("/getChatList", { params });
}

// 发送信息
export function postMessage(data: sendMessageParams) {
  return axios.post<sendMessageParams>("/postMessage", data, { timeout: 2000 });
}

// 获取用户列表
export function apiGetUserList(params: getUserListParams) {
  return axios.get<getUserListParams, getUserListRes>("/getUserList", {
    params,
  });
}

// 用户登录
export function userLogin(data: Login.params) {
  return axios.post<Login.params, Login.res>("/userLogin", data);
}

// 退出登录
export function loginOut(data: { userid: string | null }) {
  return axios.post("/loginOut", data);
}

// 通过 token 获取用户信息
export function apiGetUserInfo() {
  return axios.get<undefined, getUserInfo.res>("/user/getUserInfo");
}

// 添加好友
export function addFriend(params: getUserListParams) {
  return axios.get("/addFriend", { params });
}

// 创建群聊
export function apiCreateGroup(params: createGroupParams) {
  return axios.post<createGroupParams, createGroupRes>("/createGroup", params);
}

// TODO 为群聊添加成员
export function apiAddGroupMember(params: AddGroupMember.params) {
  return axios.post<createGroupParams, AddGroupMember.res>(
    "/addGroupMember",
    params
  );
}
