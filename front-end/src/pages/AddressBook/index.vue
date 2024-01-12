<template>
  <div>
    <van-nav-bar fixed placeholder safe-area-inset-top title="通讯录">
      <!-- <template #right>
        <van-popover
          v-model:show="showPopover"
          :actions="actions"
          @select="onSelect"
          placement="bottom-end"
          :offset="[12, 8]"
        >
          <template #reference>
            <van-icon name="plus" size="18" />
          </template>
        </van-popover>
      </template> -->
    </van-nav-bar>

    <van-cell title="添加好友" />
    <van-cell title="群列表" />
    <van-cell title="订阅机器人" />
    <van-cell title="机器人列表" />

    <van-loading type="spinner" v-if="userListLoading" />
    <van-index-bar :index-list="initialArr" class="userList">
      <template v-for="char in initialArr" :key="char">
        <van-index-anchor :index="char">{{
          char.toUpperCase()
        }}</van-index-anchor>
        <template v-for="user in userList" :key="user.id + char">
          <van-cell
            v-if="user.initial === char"
            center
            @click="handleUserItem(user.id)"
            :value="user.online"
          >
            <template #icon>
              <van-image
                width="40"
                height="40"
                :src="user.avatar"
                class="avatar"
              />
            </template>
            <template #title>
              <p class="userTitle">{{ user.name }}</p>
            </template>
          </van-cell>
        </template>
      </template>
    </van-index-bar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { showConfirmDialog, showToast } from "vant";
import { pinyin } from "pinyin-pro";
import { useStore } from "@/store/user";
import { apiGetUserList, apiPutUserLoginout } from "@/api";

const store = useStore();

// 展示时会增加额外字段
type ShowUserItem = API_USER.GetUserList["Users"] & { initial: string };

const userList = ref<ShowUserItem[]>([]);
const initialArr = ref<string[]>([]);
const isRoot = computed(() => store.userInfo?.name === "zzb"); // TODO root 判断
const userListLoading = ref(false);

onMounted(() => {
  fetchUserList();
});

const fetchUserList = async () => {
  const userid = store.userInfo?.id!;

  userListLoading.value = true;
  if (!userid) {
    // 临时方案 若 store 中没有用户 id，过 1s 后重新请求
    setTimeout(fetchUserList, 1000);
    return;
  }
  const { data = [] } = await apiGetUserList({ userid });
  // await new Promise((resolve) => setTimeout(resolve, 3000));

  userList.value = data
    .filter((i) => i.id !== userid)
    .map((i) => ({
      ...i,
      initial: pinyin(i.name[0], { toneType: "none" })[0] || "", // 补充 initial 字段
    }))
    .sort((a, b) => a.initial.charCodeAt(0) - b.initial.charCodeAt(0)); // 按首字母排序

  // 用户好友列表的首字母数组
  initialArr.value = [...new Set(userList.value.map((i) => i.initial))];

  // console.log("initialArr", initialArr);

  userListLoading.value = false;
};

const handleUserItem = (id: string) => {
  if (!isRoot.value) return;
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
.userList {
  padding: 24px 0 50px;
  .userTitle {
    margin-left: 8px;
  }
}
</style>
