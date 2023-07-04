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
      <van-cell title="版本" value="0.0.6" label="" />
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
import { computed, ref, onMounted } from "vue";
import { showConfirmDialog, showSuccessToast, showToast } from "vant";
import { useStore } from "@/store/user";
import router from "@/router";
import { apiGetUserList, apiLoginOut, apiPutUserLoginout } from "@/api";

const store = useStore();

const loginoutLoading = ref(false);
const username = computed(() => store.userInfo?.name || "未登录");
const userListLoading = ref(false);
const userList = ref<{ id: string; name: string; avatar: string, online?: number }[]>([]); // TODO type
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
