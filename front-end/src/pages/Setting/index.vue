<template>
  <div class="bg">
    <h3>设置</h3>
    <van-image
      round
      :src="store.userInfo?.avatar"
      class="avatar"
      width="5rem"
      height="5rem"
    />

    <van-cell-group>
      <van-cell title="用户名" :value="username" label="" />
      <van-cell title="版本" value="0.0.4" label="" />
    </van-cell-group>
    <van-button
      class="loginOut"
      type="danger"
      :disabled="!store.userInfo"
      @click="handleLoginOut"
      :loading="loginoutLoading"
      >退出登录</van-button
    >
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { showSuccessToast } from "vant";
import { useStore } from "@/store/user";
import router from "@/router";
import { apiLoginOut } from "@/api";

const loginoutLoading = ref(false);
const store = useStore();
const username = computed(() => store.userInfo?.name || "未登录");
const handleLoginOut = async () => {
  const userid = store.userInfo?.id!;

  loginoutLoading.value = true;

  await apiLoginOut({ userid });

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

  .avatar {
    display: block;
    margin: 0 auto;
    padding: 10px 0;
  }

  .loginOut {
    margin-bottom: 12px;
    width: 100%;
  }
}
</style>
