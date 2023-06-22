import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
