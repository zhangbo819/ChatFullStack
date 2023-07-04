import { defineStore } from "pinia";
import { User } from "@/api/interface";

// useStore 可以是 useUser、useCart 之类的任何东西
// 第一个参数是应用程序中 store 的唯一 id
export const useStore = defineStore("user", {
  state(): {
    userInfo: null | User;
    token: null | string;
    unread: number;
  } {
    return {
      userInfo: null,
      token: localStorage.getItem("token"),
      unread: 0,
    };
  },
});
