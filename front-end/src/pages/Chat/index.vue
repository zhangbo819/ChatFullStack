<template>
  <!-- {{ hiddenInput }} -->
  <div class="bg">
    <div @click="hiddenInput = !hiddenInput">Chat</div>
    <ElInput
      v-if="hiddenInput"
      v-model="hiddenInputV"
      @keyup.enter="changeUser"
      placeholder="输入你的角色"
    />
    <div class="chatList" v-loading="dataLoading">
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
      <ElInput class="input" v-model="inputValue" @keyup.enter="sendMessage" />
      <ElButton class="btn" @click="sendMessage" :loading="loading"
        >发送</ElButton
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { ElButton, ElInput, ElMessage } from "element-plus";
import axios from "axios";
import { getList } from "./api";

const local = "local";
const remote = "remote";

interface DataType {
  time: string | number;
  msg: string;
  form: string;
}

const user = ref(local);
const data = ref<DataType[]>([]);
const timer = ref<any>(null);
const inputValue = ref("");
const dataLoading = ref(false);

const startTimer = () => {
  timer.value && clearTimeout(timer.value);
  timer.value = setTimeout(async () => {
    // TODO api
    dataLoading.value = true;
    // await getList({ form: user.value, time: Date.now() });
    const res = [
      { time: 1686799984400, msg: "hello remote", form: local },
      { time: 1686799994400, msg: "hello local", form: remote },
      {
        time: 1686799994400,
        msg: "几拿地价佛is啊就是滴飞机束带结发is觉得佛i就是扫地机佛山降低佛山街司法鉴定哦if时间",
        form: remote,
      },
    ];
    dataLoading.value = false;

    data.value = res.map((i) => ({
      ...i,
      time: new Date(i.time).toLocaleString(),
    }));

    startTimer();
  }, 1000);
};

onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  timer.value && clearTimeout(timer.value);
});

const loading = ref(false);
const sendMessage = async () => {
  loading.value = true;
  console.log("inputValue.value", inputValue.value);
  const params = {
    addData: [{ time: Date.now(), msg: inputValue.value, form: user.value }],
  };
  // TODO api
  const url = "";
  axios
    .post(url, params, { timeout: 2000 })
    .then((res) => {
      ElMessage.success("发送成功");
    })
    .catch((err) => {
      ElMessage.error("发送失败 " + err);
    })
    .finally(() => {
      loading.value = false;
    });
};

const hiddenInput = ref(false);
const hiddenInputV = ref("");
const changeUser = () => {
  if (hiddenInputV.value && [local, remote].includes(hiddenInputV.value)) {
    user.value = hiddenInputV.value;
    hiddenInput.value = false;
    hiddenInputV.value = "";
  } else {
    ElMessage("无效");
  }
};
</script>

<style scoped lang="less">
.bg {
  position: relative;
  // width: 100%;
}
.chatList {
  display: flex;
  flex-direction: column;
  width: 100%;
  // height: calc(100vh - 55px);
  margin-top: 10px;
  padding: 24px 0;
  padding-bottom: 80px;
  background-color: #f1f2f3;
  // overflow-y: scroll;

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
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  // padding-right: 12px;
  background-color: #fff;
  .input {
    padding: 12px;
    // width: calc(100% - 24px);
    flex: 1;
  }
  .btn {
    margin-right: 12px;
  }
}
</style>
