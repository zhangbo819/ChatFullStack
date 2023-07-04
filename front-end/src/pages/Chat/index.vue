<template>
  <div class="bg">
    <van-nav-bar
      fixed
      placeholder
      safe-area-inset-top
      :title="title"
      left-arrow
      @click-left="onClickLeft"
    />

    <div class="chatList">
      <van-loading v-if="dataLoading" size="24px" vertical class="dataLoading"
        >加载中...</van-loading
      >
      <template v-else>
        <div class="empty" v-if="data.length === 0">
          你们现在是好友了，快开始聊天吧
        </div>
        <div
          v-for="(item, index) in data"
          :key="item.msg + index"
          :class="[
            'chatItem',
            { 'chatItem-right': item.form === store.userInfo?.id },
          ]"
        >
          <van-image
            v-if="item.form !== store.userInfo?.id"
            width="40"
            height="40"
            :src="item.avatar"
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
            :src="item.avatar"
            class="avatar"
          />
        </div>
      </template>
    </div>

    <div class="bottomTooltip">
      <van-field
        class="input"
        v-model="inputValue"
        @keyup.enter="sendMessage"
        :placeholder="`发送给 ${title}`"
      />
      <van-button
        class="btn"
        type="primary"
        :disabled="inputValue === ''"
        @click="sendMessage"
        :loading="loading"
        >发送</van-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from "vue";
import { showToast } from "vant";
import { useRoute } from "vue-router";
import { useStore } from "@/store/user";
import { User } from "@/api/interface";
import {
  apiGetChatList,
  apiPostMessage,
  apiGetUserInfoById,
  apiGetGroupInfoById,
} from "@/api";
import { GetGroupInfoById } from "@/api/interface";
import { DataType, ShowDataType } from "./interface";

const route = useRoute();
const store = useStore();
const data = ref<ShowDataType[]>([]);
const timer = ref<any>(null);
const inputValue = ref("");
const dataLoading = ref(false);
const title = ref("Loading");
const personUserInfo = ref<null | User>(null);
const groupInfo = ref<null | GetGroupInfoById.GroupInfo>(null);
const mapId2Avatar = ref<Record<string, string>>({});

const isGroup = computed<"1" | "0">(() => (route.query.isGroup ? "1" : "0")); // 是否是群聊

const onClickLeft = () => history.back();

const startTimer = (immediate = false) => {
  timer.value && clearTimeout(timer.value);
  const fn = async () => {
    dataLoading.value = true;
    const res: { data: DataType[] } = await apiGetChatList({
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
      avatar: mapId2Avatar.value[i.form],
    })) as ShowDataType[];

    startTimer(false);
  };
  if (immediate) {
    fn();
  }
  timer.value = setTimeout(fn, 30 * 1000);
};

onMounted(() => {
  if (route.query.isGroup) {
    // 群聊
    apiGetGroupInfoById({ id: route.query.id as string }).then((res) => {
      title.value = res.data.name;
      groupInfo.value = res.data;

      const newMapId2Avatar: Record<string, string> = {};
      res.data.memberList.forEach((item) => {
        newMapId2Avatar[item.id] = item.avatar;
      });
      mapId2Avatar.value = newMapId2Avatar;

      console.log('mapId2Avatar', mapId2Avatar)

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

const loading = ref(false);
const sendMessage = async () => {
  loading.value = true;
  // console.log("inputValue.value", inputValue.value);
  const msg = inputValue.value;
  const params = {
    form: store.userInfo?.id!,
    to: route.query.id as string,
    isGroup: isGroup.value,
    addData: [{ time: Date.now(), msg, form: store.userInfo?.id! }],
  };

  inputValue.value = "";
  apiPostMessage(params)
    .then((res) => {
      // showToast({
      //   message: "发送成功",
      //   position: "top",
      // });

      startTimer(true);
    })
    .catch((err) => {
      showToast({
        message: "发送失败 " + err,
        position: "top",
      });
    })
    .finally(() => {
      loading.value = false;
    });
};
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
  height: calc(
    100vh - var(--van-nav-bar-height) - 61px - env(safe-area-inset-bottom)
  );
  overflow-y: scroll;
  padding: 12px 8px 0;

  .empty {
    margin: 8px;
  }

  .chatItem {
    position: relative;
    display: flex;
    flex-direction: row;
    margin: 11px;
    align-self: flex-start;
    // background-color: #fff;
    max-width: 60%;

    &.chatItem-right {
      align-self: flex-end;
      .message {
        margin-right: 8px;
        background-color: aquamarine;
        .content {
          text-align: right;
        }
      }
    }

    &:hover {
      .time {
        display: block;
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
        width: 100%;
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

.bottomTooltip {
  position: fixed;
  left: 0;
  bottom: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: calc(100% - 16px);
  padding: 8px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  background-color: #fff;
  border: 0 solid var(--van-border-color);
  border-top-width: 1px;
  .input {
    // padding: 12px;
    // width: calc(100% - 24px);
    flex: 1;
  }
  .btn {
    margin-left: 12px;
  }
}
</style>
