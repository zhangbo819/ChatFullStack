<template>
  <router-view :class="{ pages: tabberShow }" />

  <van-tabbar fixed route placeholder v-show="tabberShow">
    <van-tabbar-item
      replace
      to="/"
      icon="chat-o"
      :badge="store.unread === 0 ? undefined : store.unread"
      >消息列表</van-tabbar-item
    >
    <van-tabbar-item replace to="/addressBook" icon="friends-o"
      >通讯录</van-tabbar-item
    >
    <van-tabbar-item replace to="/setting" icon="setting-o"
      >设置</van-tabbar-item
    >
  </van-tabbar>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "@/store/user";

const store = useStore();
const route = useRoute();

const tabberShow = computed(() => !["/Chat", "/login"].includes(route.path));

// 获取全局用户信息
store.fetchUserInfo();
</script>

<style lang="less" scoped>
.pages {
  max-height: calc(100vh - var(--van-tabbar-height));
}
</style>
