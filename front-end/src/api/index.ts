import axiosCommon from "axios";
import { sendMessageParams } from "@/pages/Chat/interface";
import { ElNotification } from "element-plus";

const axios = axiosCommon.create({});

axios.interceptors.request.use((config) => {
  config.headers = {
    Authorization: localStorage.getItem("token"),
    ...(config.headers as any),
  };

  return config;
});

axios.interceptors.response.use((res) => {
  const { data } = res;
  if (data.errcode === 0) {
    return data;
  } else if (data.errcode === 401) {
    ElNotification.error({
      message: "您的网络发生异常，需重新登录",
    });

    setTimeout(() => {
      window.location.href = window.location.origin + "/login";
    }, 1000);
  } else {
    ElNotification.error({
      message: data.message,
    });
    throw new Error(data.message)
  }
});

// const common = 'http://39.106.128.158:9000/api'
const common = "/api";

// 获取列表
export function getList(params: Record<string, any>) {
  return axios.get(common + "/getList", { params });
}

// 发送信息
export function postMessage(data: sendMessageParams) {
  return axios.post(common + "/postMessage", data, { timeout: 2000 });
}

interface getUserListParams {
  userid: string;
}

// 获取用户列表
export function getUserList(params: getUserListParams) {
  return axios.get(common + "/getUserList", { params });
}

// 用户登录
export function userLogin(data: { userid: string }) {
  return axios.post(common + "/userLogin", data);
}
