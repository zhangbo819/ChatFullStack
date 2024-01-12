<template>
  <div class="bg">
    <van-nav-bar
      fixed
      placeholder
      safe-area-inset-top
      :title="title"
      left-arrow
      @click-left="onClickLeft"
    >
      <template #right v-if="isGroup === '1'">
        <van-icon name="ellipsis" @click="showDetail = true" />
      </template>
    </van-nav-bar>

    <!-- 群聊详情 -->
    <GroupDetail
      v-if="isGroup === '1'"
      v-model="showDetail"
      :GroupInfo="groupInfo"
    />

    <div class="chatList" ref="refChatList">
      <van-loading
        v-if="dataLoading && data.length === 0"
        size="24px"
        vertical
        class="dataLoading"
        >加载中...</van-loading
      >
      <template v-else>
        <div class="empty" v-if="data.length === 0">
          你们现在是好友了，快开始聊天吧
        </div>
        <div
          v-for="item in data"
          :key="item.id"
          :class="[
            'chatItem',
            {
              'chatItem-right': item.form === store.userInfo?.id,
            },
          ]"
        >
          <van-image
            v-if="item.form !== store.userInfo?.id"
            width="40"
            height="40"
            :src="mapId2Avatar[item.form]"
            class="avatar"
          />
          <section class="message">
            <p class="time">{{ item.time }}</p>
            <p class="content">{{ item.msg }}</p>
          </section>
          <van-image
            v-if="item.form === store.userInfo?.id"
            width="40"
            height="40"
            :src="mapId2Avatar[item.form]"
            class="avatar"
          />
        </div>
      </template>
    </div>

    <!-- 底部工具栏 -->
    <BottomTooltip
      :form="store.userInfo?.id"
      :to="(route.query.id as string)"
      :isGroup="isGroup"
      :startTimer="startTimer"
      :title="title"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "@/store/user";
import { User } from "@/api/interface";
import { apiGetChatList, apiGetUserInfoById, apiGetGroupInfoById } from "@/api";
import BottomTooltip from "./BottomTooltip/index.vue";
import GroupDetail from "./GroupDetail.vue";
import { ShowDataType } from "./interface";

const route = useRoute();
const store = useStore();

const data = ref<ShowDataType[]>([]);
const timer = ref<any>(null);
const dataLoading = ref(false);
const title = ref("Loading");
const personUserInfo = ref<null | User>(null); // 单聊 信息
const groupInfo = ref<null | API_USER.GetGroupInfoById["GroupInfo"]>(null); // 群聊 信息
const mapId2Avatar = ref<Record<string, string>>({}); // id to 头像 map
const refChatList = ref(); // div
const showDetail = ref(false);

const isGroup = computed<"1" | "0">(() =>
  route.query.isGroup == "1" ? "1" : "0"
); // 是否是群聊

const onClickLeft = () => history.back();

const startTimer = (immediate = false) => {
  timer.value && clearTimeout(timer.value);
  const fn = async () => {
    dataLoading.value = true;
    const res = await apiGetChatList({
      form: store.userInfo?.id!,
      to: route.query.id as string,
      isGroup: isGroup.value,
      // time: Date.now(),
    });
    // console.log('res', res)
    // await new Promise((resolve) => {
    //   setTimeout(resolve, 3000);
    // });
    dataLoading.value = false;

    // 洗下数据
    data.value = res.data.map((i) => ({
      ...i,
      time: new Date(i.time).toLocaleString(),
      id: i.msg + i.form + i.time,
      // avatar: mapId2Avatar.value[i.form],
    })) as ShowDataType[];

    // 滚动到底部
    setTimeout(() => {
      if (refChatList.value) {
        refChatList.value.scrollTop = refChatList.value.scrollHeight;
      }
    });

    startTimer(false);
  };
  if (immediate) {
    fn();
  }
  timer.value = setTimeout(fn, 30 * 1000);
};

onMounted(() => {
  if (route.query.isGroup == "1") {
    // 群聊
    apiGetGroupInfoById({ id: route.query.id as string }).then((res) => {
      title.value = "[群]" + res.data.name;
      // res.data.memberList = res.data.memberList.reduce((r) => {
      //   r.push(...res.data.memberList);
      //   r.push(...res.data.memberList);
      //   return r;
      // }, [] as any);
      groupInfo.value = res.data;

      const newMapId2Avatar: Record<string, string> = {};
      res.data.memberList.forEach((item) => {
        newMapId2Avatar[item.id] = item.avatar;
      });
      mapId2Avatar.value = newMapId2Avatar;

      // console.log("mapId2Avatar", mapId2Avatar);

      startTimer(true);
    });
  } else {
    // 私聊
    apiGetUserInfoById({ id: route.query.id as string }).then((res) => {
      title.value = res.data.name;
      personUserInfo.value = res.data;

      mapId2Avatar.value = {
        [store.userInfo?.id!]: store.userInfo?.avatar!,
        [res.data.id]: res.data.avatar,
      };

      startTimer(true);
    });
  }
});

onUnmounted(() => {
  timer.value && clearTimeout(timer.value);
});
</script>

<style scoped lang="less">
.bg {
  position: relative;
  overflow: hidden;
  // background-color: #f1f2f3;
  background-color: #fff;
}
.chatList {
  display: flex;
  flex-direction: column;
  // width: 100%;
  height: calc(100% - var(--van-nav-bar-height) - 61px);
  overflow-y: scroll;
  padding: 12px 8px;
  box-sizing: border-box;

  .empty {
    margin: 8px;
  }

  .chatItem {
    position: relative;
    display: flex;
    flex-direction: row;
    margin: 12px;
    align-self: flex-start;
    // background-color: #fff;
    max-width: 60%;

    &.chatItem-right {
      align-self: flex-end;
      .message {
        margin-right: 8px;
        background-color: aquamarine;

        .time {
          right: 0;
          left: auto;
        }
        .content {
          text-align: right;
        }
      }
    }

    &:hover {
      .message {
        .time {
          display: block;
        }
      }
    }

    .avatar {
      flex-shrink: 0;
    }

    .message {
      background-color: #eff3f5;
      border-radius: 8px;
      margin-left: 8px;
      padding: 8px;
      .time {
        display: none;
        position: absolute;
        top: -18px;
        left: 0;
        min-width: 100%;
        color: #9a9b9d;
        text-align: right;
        font-size: 12px;
        white-space: nowrap;
      }

      .content {
        // margin-top: 6px;
        width: 100%;
        color: #181a1d;
        word-break: break-all;
      }
    }
  }

  .dataLoading {
    margin-top: 24px;
  }
}
</style>
