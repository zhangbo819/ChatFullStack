<template>
  <div class="bg">
    <van-nav-bar fixed placeholder safe-area-inset-top title="消息列表">
      <template #right>
        <van-popover
          v-model:show="showPopover"
          :actions="actions"
          @select="onSelect"
          placement="bottom-end"
          :offset="[12, 8]"
          >
          <!-- theme="dark" -->
          <template #reference>
            <van-icon name="plus" size="18" />
          </template>
        </van-popover>
      </template>
    </van-nav-bar>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        class="list"
        v-model:loading="userListLoading"
        :finished="finished"
        finished-text="没有更多了"
        @load="fetchUserList"
      >
        <van-cell
          v-for="item in userList"
          :key="item"
          :title="item"
          v-loading="userListLoading"
          class="userItem"
          @click="handleUserItem(item)"
        />
        <van-cell v-if="userList.length == 0 && !userListLoading"
          >还没有好友呢</van-cell
        >
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { onActivated, onMounted, ref } from "vue";
import { getUserList } from "@/api";
import router from "@/router";

const userList = ref([]);
const userListLoading = ref(false);
const finished = ref(false);
const refreshing = ref(false);

const fetchUserList = async () => {
  if (refreshing.value) {
    refreshing.value = false;
    userList.value = [];
  }

  const user = localStorage.getItem("token"); // TODO mv to store
  userListLoading.value = true;
  const { data } = await getUserList({ userid: user });
  // await new Promise((resolve) => {
  //   setTimeout(resolve, 3000);
  // });
  userListLoading.value = false;

  userList.value = data;
  finished.value = true;
};

const onRefresh = () => {
  // 清空列表数据
  finished.value = false;

  // 重新加载数据
  // 将 loading 设置为 true，表示处于加载状态
  userListLoading.value = true;
  fetchUserList();
};

onMounted(() => {
  fetchUserList();
});

onActivated(() => {
  fetchUserList();
});

const handleUserItem = (id: string) => {
  router.push({ path: "/Chat", query: { id } });
};

const showPopover = ref(false);
interface Action {
  text: string;
  value: number;
}
const actions: Action[] = [{ text: "添加好友", value: 0 }];
const onSelect = (action: Action) => {
  // console.log("action", action);
  if (action.value === 0) {
    router.push({ path: '/AddFriend' })
  }
};
</script>

<style scoped lang="less">
.bg {
  background-color: #f1f2f3;
}

.list {
  min-height: calc(
    100vh - 50px - var(--van-tabbar-height) - env(safe-area-inset-bottom)
  );
}
.userItem {
  padding: 8px;
  height: 60px;

  :deep .van-cell__title {
    display: flex;
    align-items: center;
  }

  > p {
    font-size: 18px;
    font-weight: bold;
  }
  &:hover {
    opacity: 0.8;
  }
}
</style>
