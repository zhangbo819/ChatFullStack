<template>
  <div>
    <header class="header">
      <h3>好友列表</h3>
      <ElButton @click="handleLoginOut" :loading="loginoutLoading"
        >退出登录</ElButton
      >
    </header>

    <div
      v-for="item in userList"
      :key="item"
      v-loading="userListLoading"
      class="userItem"
      @click="handleUserItem(item)"
    >
      <p>{{ item }}</p>
    </div>
    <div v-if="userList.length == 0">还没有好友呢</div>
  </div>
</template>

<script setup lang="ts">
import { onActivated, onMounted, ref } from "vue";
import { ElButton, ElNotification } from "element-plus";
import { getUserList, loginOut } from "@/api";
import router from "@/router";

const userList = ref([]);
const userListLoading = ref(false);

const fetchUserList = async () => {
  const user = localStorage.getItem("token"); // TODO mv to store
  userListLoading.value = true;
  const { data } = await getUserList({ userid: user });
  userListLoading.value = false;

  userList.value = data;
};

onMounted(() => {
  fetchUserList();
});

onActivated(() => {
  fetchUserList();
});

const loginoutLoading = ref(false);
const handleLoginOut = async () => {
  const user = localStorage.getItem("token");

  loginoutLoading.value = true;

  await loginOut({ userid: user });

  localStorage.removeItem("token");
  loginoutLoading.value = false;

  ElNotification.success("退出登录成功");

  fetchUserList();
};

const handleUserItem = (id: string) => {
  router.push({ path: "/Chat", query: { id } });
};
</script>

<style scoped lang="less">
.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
}
.userItem {
  margin: 8px;
  padding: 8px;
  border-radius: 8px;
  background: #ebeced;

  > p {
    font-size: 18px;
    font-weight: bold;
  }
  &:hover {
    opacity: 0.8;
  }
}
</style>
