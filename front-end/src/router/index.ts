import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Index",
    meta: {
      title: "首页",
      //            keepAlive: true,
      //            requireAuth: true
    },
    component: () => import("@/pages/home/index.vue"),
  },
  {
    path: "/setting",
    name: "Setting",
    meta: {
      title: "设置页",
    },
    component: () => import("@/pages/Setting/index.vue"),
  },
  {
    path: "/login",
    name: "Login",
    meta: {
      title: "登录",
      // keepAlive: true,
      // requireAuth: false,
    },
    component: () => import("@/pages/Login/index.vue"),
  },
  {
    path: "/Chat",
    name: "Chat",
    meta: {
      title: "Chat",
      //            keepAlive: true,
      //            requireAuth: true
    },
    component: () => import("@/pages/Chat/index.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
