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

    <div class="chatList" v-loading="dataLoading">
      <div class="empty" v-if="data.length === 0">
        你们现在是好友了，快开始聊天吧
      </div>
      <div
        v-for="(item, index) in data"
        :key="item.msg + index"
        :class="{ chatItem: true, local: item.form === user }"
      >
        {{ item.time }}
        <p>{{ item.msg }}</p>
      </div>
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
import { onMounted, onUnmounted, ref } from "vue";
import { showToast } from "vant";
import { getList, postMessage } from "@/api";
import { DataType } from "./interface";
import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const user = ref(localStorage.getItem("token") || "");
const data = ref<DataType[]>([]);
const timer = ref<any>(null);
const inputValue = ref("");
const dataLoading = ref(false);

const title = computed(() =>
  Array.isArray(route.query.id)
    ? route.query.id.join(",")
    : route.query.id || "未知"
);

const onClickLeft = () => history.back();

const startTimer = (immediate = false) => {
  timer.value && clearTimeout(timer.value);
  const fn = async () => {
    dataLoading.value = true;
    const res: { data: DataType[] } = await getList({
      form: user.value,
      to: route.query.id as string,
      time: Date.now(),
    });
    // console.log('res', res)

    dataLoading.value = false;

    data.value = res.data.map((i) => ({
      ...i,
      time: new Date(i.time).toLocaleString(),
    }));

    startTimer(false);
  };
  if (immediate) {
    fn();
  }
  timer.value = setTimeout(fn, 10 * 1000);
};

onMounted(() => {
  dataLoading.value = true;
  startTimer(true);
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
    form: user.value,
    to: route.query.id as string,
    addData: [{ time: Date.now(), msg, form: user.value }],
  };

  inputValue.value = "";
  postMessage(params)
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
  background-color: #f1f2f3;
}
.chatList {
  display: flex;
  flex-direction: column;
  // width: 100%;
  height: calc(
    100vh - var(--van-nav-bar-height) - 61px - env(safe-area-inset-bottom)
  );
  overflow-y: scroll;
  // margin-top: 10px;
  padding: 0 8px;

  .empty {
    margin: 8px;
  }

  .chatItem {
    margin: 8px;
    padding: 8px;
    align-self: flex-start;
    background-color: #fff;
    max-width: 50%;
    border-radius: 8px;
    color: #181a1d;

    > p {
      margin-top: 6px;
    }

    &.local {
      align-self: flex-end;
      background-color: aquamarine;
      > p {
        text-align: right;
      }
    }
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
