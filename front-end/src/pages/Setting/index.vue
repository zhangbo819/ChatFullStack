<template>
  <div class="bg">
    <h3>设置</h3>
    <!-- <van-image
      round
      :src="store.userInfo?.avatar"
      class="avatar"
      width="5rem"
      height="5rem"
      @click="changeAvaShow = true"
    /> -->
    <van-uploader
      class="avatar"
      v-model="fileList"
      :after-read="afterRead"
      max-count="1"
      :preview-options="{ closeable: true }"
    />

    <van-cell-group>
      <van-cell title="用户名" :value="username" label="" />
      <van-cell title="版本" value="0.1.1" label="" />
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
import { computed, ref, watch } from "vue";
import { UploaderProps, showFailToast, showSuccessToast } from "vant";
import { useStore } from "@/store/user";
import router from "@/router";
import { apiLoginOut, apiChangeAva } from "@/api";
import { dealImage } from "@/utils";

const store = useStore();

const loginoutLoading = ref(false);
const username = computed(() => store.userInfo?.name || "未登录");

const handleLoginOut = async () => {
  // const userid = store.userInfo?.id!;

  loginoutLoading.value = true;

  await apiLoginOut();

  localStorage.removeItem("access_token");
  loginoutLoading.value = false;

  showSuccessToast("退出登录成功");

  router.replace({ path: "/login" });
};

const fileList = ref([{ url: store.userInfo?.avatar, isImage: true }]);
watch(
  () => store.userInfo?.avatar,
  (val) => {
    fileList.value[0].url = val;
  },
);
const afterRead: UploaderProps["afterRead"] = async (file) => {
  // 此时可以自行将文件上传至服务器
  console.log(file);
  if (Array.isArray(file)) return;
  if (!file.content) return;

  file.status = "uploading";
  file.message = "上传中...";

  // console.log('url 0', file.content.length)

  const url = await dealImage(file.content, 240);

  // console.log('url 1', url.length)

  apiChangeAva({ url })
    .then((res) => {
      if (res.data) {
        showSuccessToast("更换成功");
        file.status = "done";
        file.message = "上传成功";
        store.fetchUserInfo();
      } else {
        showFailToast(res.message || "更换失败");
        file.status = "failed";
        file.message = res.message || "更换失败";
      }
    })
    .catch((_) => {
      file.status = "failed";
      file.message = "更换失败";
    });
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
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding: 10px 0;
  }

  .loginOut {
    margin-bottom: 12px;
    width: 100%;
  }
}
</style>
