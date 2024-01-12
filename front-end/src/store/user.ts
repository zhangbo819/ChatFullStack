import { defineStore } from "pinia";
import { apiGetUserInfo } from "@/api";

// useStore 可以是 useUser、useCart 之类的任何东西
// 第一个参数是应用程序中 store 的唯一 id
export const useStore = defineStore("user", {
  state(): {
    userInfo: null | API_AUTH.Login['userInfo'];
    token: null | string;
    unread: number;
  } {
    return {
      userInfo: null,
      token: localStorage.getItem("access_token"),
      unread: 0,
    };
  },
  actions: {
    fetchUserInfo() {
      apiGetUserInfo().then(async (res) => {
        this.userInfo = res.data;
      });
    },
  },
});
