<template>
  <div class="bg">
    <h3>设置</h3>
    <van-button
      class="loginOut"
      type="danger"
      @click="handleLoginOut"
      :loading="loginoutLoading"
      >退出登录</van-button
    >
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { showSuccessToast } from "vant";
import router from "@/router";
import { loginOut } from "@/api";

const loginoutLoading = ref(false);
const handleLoginOut = async () => {
  const user = localStorage.getItem("token");

  loginoutLoading.value = true;

  await loginOut({ userid: user });

  localStorage.removeItem("token");
  loginoutLoading.value = false;

  showSuccessToast("退出登录成功");

  router.replace({ path: "/login" });
};
</script>

<style lang="less" scoped>
.bg {
  padding: 8px;
  > h3 {
    margin-bottom: 12px;
  }

  .loginOut {
    width: 100%;
  }
}
</style>
