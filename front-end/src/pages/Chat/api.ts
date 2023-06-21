import axios from "axios";
import { sendMessageParams } from "./interface";

// const common = 'http://39.106.128.158:9000/api'
const common = "/api";

// 获取列表
export function getList(params: Record<string, any>) {
  return axios.get(common + "/getList", params).then((res) => res.data);
}

// 发送信息
export function postMessage(params: sendMessageParams) {
  return axios
    .post(common + "/postMessage", params, { timeout: 2000 })
    .then((res) => res.data);
}
