<template>
  <div class="bg">
    <!-- 头部 -->
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

    <!-- 列表 -->
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
          :key="item.id"
          :title="item.name"
          v-loading="userListLoading"
          class="userItem"
          @click="handleUserItem(item.id)"
        />
        <van-cell v-if="userList.length == 0 && !userListLoading"
          >还没有好友呢</van-cell
        >
        <div v-show="userListLoading">
          <van-cell v-for="i in 5" :key="i">
            <van-skeleton :row="2" />
          </van-cell>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 创建群聊 -->
    <create-group v-model="createGroupShow"></create-group>
  </div>
</template>

<script setup lang="ts">
import { onActivated, onMounted, ref } from "vue";
// import { showToast } from "vant";
import CreateGroup from "@/components/CreateGroup.vue";
import { useStore } from "@/store/user";
import { apiGetUserList } from "@/api";
import router from "@/router";

const store = useStore();
const userList = ref<{ id: string; name: string }[]>([]);
const userListLoading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const createGroupShow = ref(false);

const fetchUserList = async () => {
  if (refreshing.value) {
    refreshing.value = false;
    userList.value = [];
  }

  const userid = store.userInfo?.id || null;
  userListLoading.value = true;
  const { data = [] } = await apiGetUserList({ userid });
  // await new Promise((resolve) => setTimeout(resolve, 3000));
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
  // 获取消息列表
  fetchUserList();
});

// onActivated(() => {
//   fetchUserList();
// });

const handleUserItem = (id: string) => {
  router.push({ path: "/Chat", query: { id } });
};

const showPopover = ref(false);
interface Action {
  text: string;
  value: number;
}
const actions: Action[] = [
  { text: "添加好友", value: 0 },
  { text: "创建群聊", value: 1 },
];
const onSelect = (action: Action) => {
  // console.log("action", action);
  if (action.value === 0) {
    router.push({ path: "/AddFriend" });
  } else if (action.value === 1) {
    // showToast("敬请期待");
    createGroupShow.value = true;
  }
};
</script>

<style scoped lang="less">
.bg {
  // background-color: #f1f2f3;
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
