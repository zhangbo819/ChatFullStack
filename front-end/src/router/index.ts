import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "@/pages/home/index.vue";
import Chat from "@/pages/Chat/index.vue";

const routes: Array<RouteRecordRaw> = [
  //    {
  //      path: '/login',
  //      name: 'Login',
  //      meta: {
  //          title: '登录',
  //          keepAlive: true,
  //          requireAuth: false
  //      },
  //      component: () => import('@/pages/login.vue')
  //    },
  {
    path: "/home",
    name: "home",
    meta: {
      title: "home",
      //            keepAlive: true,
      //            requireAuth: true
    },
    component: Home,
  },
  {
    path: "/",
    name: "Index",
    meta: {
      title: "首页",
      //            keepAlive: true,
      //            requireAuth: true
    },
    component: Chat,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
