<template>
  <!-- {{ hiddenInput }} -->
  <div class="bg">
    <header>
      <h3>{{ route.query.id }}</h3>
      <!-- <ElInput
        v-if="hiddenInput"
        v-model="hiddenInputV"
        @keyup.enter="changeUser"
        placeholder="输入你的角色"
      /> -->

      <!-- <ElButton @click="startTimer(true)">刷新</ElButton> -->
    </header>

    <div class="chatList" v-loading="dataLoading">
      <div class="empty" v-if="data.length === 0">你们现在是好友了，快开始聊天吧</div>
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
import { getList, postMessage } from "@/api";
import { DataType } from "./interface";
import { useRoute } from "vue-router";

// const local = "local";
// const remote = "remote";

const route = useRoute();
const user = ref(localStorage.getItem("token") || "");
const data = ref<DataType[]>([]);
const timer = ref<any>(null);
const inputValue = ref("");
const dataLoading = ref(false);

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
      ElMessage.success("发送成功");
      startTimer(true);
    })
    .catch((err) => {
      ElMessage.error("发送失败 " + err);
    })
    .finally(() => {
      loading.value = false;
    });
};

// const hiddenInput = ref(false);
// const hiddenInputV = ref("");
// const changeUser = () => {
//   if (hiddenInputV.value && [local, remote].includes(hiddenInputV.value)) {
//     user.value = hiddenInputV.value;
//     hiddenInput.value = false;
//     hiddenInputV.value = "";
//   } else {
//     ElMessage("无效");
//   }
// };
</script>

<style scoped lang="less">
.bg {
  position: relative;
  padding: 8px;
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
