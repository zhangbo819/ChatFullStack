<template>
  <div class="bg">
    <h3>设置</h3>
    <van-cell-group>
      <van-cell title="用户名" :value="username" label="" />
      <van-cell title="版本" value="0.0.3" label="" />
    </van-cell-group>
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
const username = localStorage.getItem("username") || "未登录"; // TODO
const handleLoginOut = async () => {
  const userid = localStorage.getItem("token");

  loginoutLoading.value = true;

  await loginOut({ userid });

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
    text-align: center;
  }

  .loginOut {
    margin-bottom: 12px;
    width: 100%;
  }
}
</style>
