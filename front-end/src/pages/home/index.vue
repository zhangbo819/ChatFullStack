<template>
  <div>
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
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="list">
      <van-list
        v-model:loading="userListLoading"
        :finished="finished"
        finished-text="没有更多了"
        @load="fetchMessageList"
      >
        <van-cell
          v-for="item in messageList"
          :key="item.id"
          v-loading="userListLoading"
          :class="['userItem', { isGroup: +item.isGroup }]"
          @click="handleUserItem(item)"
          center
        >
          <template #title>
            <van-badge :content="item.count" max="99" :show-zero="false">
              <van-image width="40" height="40" :src="item.avatar" />
            </van-badge>
            <span class="userItem-title">{{
              `${+item.isGroup ? "[群]" : ""}` + item.name
            }}</span>
          </template>
          <p>{{ `[${item.count}条] ${item.lastMsg}` }}</p>
          <p>{{ new Date(item.time).toLocaleString() }}</p>
        </van-cell>

        <van-cell
          v-if="messageList.length == 0 && !userListLoading"
          title="还没有好友呢"
        />

        <div v-show="userListLoading">
          <van-cell v-for="i in 5" :key="i">
            <van-skeleton :row="2" />
          </van-cell>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 创建群聊 -->
    <create-group v-model="createGroupShow" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
// import { showToast } from "vant";
import router from "@/router";
import CreateGroup from "@/components/CreateGroup.vue";
import { useStore } from "@/store/user";
import { apiGetMessageList, apiReadMessage } from "@/api";

const store = useStore();
const messageList = ref<API_CHAT.GetMessageList["resData"]>([]);
const userListLoading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const createGroupShow = ref(false);

const fetchMessageList = async () => {
  if (refreshing.value) {
    refreshing.value = false;
    messageList.value = [];
  }

  userListLoading.value = true;
  const { data = [] } = await apiGetMessageList({ id: store.userInfo?.id! });
  // await new Promise((resolve) => setTimeout(resolve, 3000));
  userListLoading.value = false;

  messageList.value = data.sort((a, b) => Number(b.time) - Number(a.time));
  finished.value = true;
};

// 将未读消息数保存到全局
watch(
  () => messageList.value,
  () => {
    store.unread = messageList.value.reduce((r, item) => {
      r += item.count;
      return r;
    }, 0);
  }
);

const onRefresh = () => {
  // 清空列表数据
  finished.value = false;

  // 重新加载数据
  // 将 loading 设置为 true，表示处于加载状态
  userListLoading.value = true;
  fetchMessageList();
};

watch(
  () => store.userInfo?.id,
  (val) => {
    if (val) {
      // 获取消息列表
      fetchMessageList();
    }
  }
);

// onMounted(() => {
//   fetchMessageList();
// });

// onActivated(() => {
//   fetchUserList();
// });

const handleUserItem = (item: API_CHAT.GetMessageList["resItem"]) => {
  const { id, isGroup, count } = item;
  // 先读消息
  const callback = () => router.push({ path: "/Chat", query: { id, isGroup } });

  if (count > 0) {
    apiReadMessage({ userid: store.userInfo?.id!, targetId: id }).finally(
      () => {
        // 再跳
        callback();
      }
    );
  } else {
    callback();
  }
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
// .bg {
// background-color: #f1f2f3;
// }

.list {
  // min-height: calc(
  //   100vh - 50px - var(--van-tabbar-height) - env(safe-area-inset-bottom)
  // );
  height: calc(100% - var(--van-nav-bar-height));
  overflow-y: auto;
  // padding-bottom: 77px;
}
.userItem {
  padding: 12px 8px;
  min-height: 60px;

  :deep .van-cell__title {
    display: flex;
    align-items: center;
  }

  &.isGroup {
    // background-color: ;
  }

  .userItem-title {
    margin-left: 8px;
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
