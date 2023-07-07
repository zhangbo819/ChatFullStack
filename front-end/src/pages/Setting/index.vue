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
      <van-cell title="版本" value="0.0.8" label="" />
    </van-cell-group>

    <div class="userList" v-if="isRoot">
      <div
        v-for="user in userList"
        :key="user.id"
        :name="user.id"
        shape="square"
        class="userItem"
        @click="handleUserItem(user.id)"
      >
        {{ user.name }}
        <van-image width="40" height="40" :src="user.avatar" class="avatar" />
        {{ user.online }}
      </div>
      <van-loading type="spinner" v-if="userListLoading" />
    </div>

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
import { computed, ref, onMounted, watch } from "vue";
import {
  UploaderProps,
  showConfirmDialog,
  showFailToast,
  showSuccessToast,
  showToast,
} from "vant";
import { useStore } from "@/store/user";
import router from "@/router";
import {
  apiGetUserList,
  apiLoginOut,
  apiPutUserLoginout,
  apiChangeAva,
} from "@/api";
import { dealImage } from "@/utils";

const store = useStore();

const loginoutLoading = ref(false);
const username = computed(() => store.userInfo?.name || "未登录");
const userListLoading = ref(false);
const userList = ref<API_USER.GetUserList["Users"][]>([]);
const isRoot = computed(() => store.userInfo?.name === "zzb"); // TODO root 判断

onMounted(() => {
  if (isRoot.value) {
    fetchUserList();
  }
});

const fetchUserList = async () => {
  const userid = store.userInfo?.id!;

  userListLoading.value = true;
  const { data = [] } = await apiGetUserList({ userid });
  // await new Promise((resolve) => setTimeout(resolve, 3000));
  userList.value = data.filter((i) => i.id !== userid);
  userListLoading.value = false;
};

const handleLoginOut = async () => {
  const userid = store.userInfo?.id!;

  loginoutLoading.value = true;

  await apiLoginOut({ userid });

  localStorage.removeItem("token");
  loginoutLoading.value = false;

  showSuccessToast("退出登录成功");

  router.replace({ path: "/login" });
};

const handleUserItem = (id: string) => {
  showConfirmDialog({
    title: "提示",
    message: "确定让该用户下线吗",
  })
    .then(() => {
      apiPutUserLoginout({ id }).then((res) => {
        showToast(res.message);
        userList.value = [];
        fetchUserList();
      });
    })
    .catch(() => {
      // on cancel
    });
};

const fileList = ref([{ url: store.userInfo?.avatar, isImage: true }]);
watch(
  () => store.userInfo?.avatar,
  (val) => {
    fileList.value[0].url = val;
  }
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

.userList {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  padding: 16px 8px;
  .userItem {
    margin-right: 8px;
    text-align: center;
  }
}
</style>
