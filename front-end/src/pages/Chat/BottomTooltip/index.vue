<template>
  <!-- <div>
    <button @click="recOpen">打开录音,请求权限</button>
    | <button @click="recStart">开始录音</button>
    <button @click="recStop">结束录音</button>
    | <button @click="recPlay">本地试听</button>
  </div>
  <div style="padding-top: 5px">
    <div
      style="
        border: 1px solid #ccc;
        display: inline-block;
        vertical-align: bottom;
      "
    >
      <div style="height: 100px; width: 300px" ref="recwave"></div>
    </div>
  </div> -->

  <div class="bottomTooltip">
    <!-- <van-icon
      class="recordIcon"
      name="volume-o"
      @click="showRecord = !showRecord"
    /> -->

    <van-field
      v-show="!showRecord"
      class="input"
      v-model="inputValue"
      @keyup.enter="sendMessage"
      :placeholder="`发送给 ${title}`"
    />
    <!-- <div
      v-show="showRecord"
      class="record"
      @click="inRecord ? recStop() : recStart()"
    >
      {{ inRecord ? "再次按下 停止" : "按下 说话 (测试)" }}
    </div> -->
    <!-- @click="inRecord ? refstopRecord && refstopRecord() : record()" -->
    <!-- @mousedown="record"
    @mouseup="refstopRecord && refstopRecord()"
    @touchstart="record"
    @touchend="refstopRecord && refstopRecord()" -->

    <!-- <audio ref="refAudio" :src="audioUrl"></audio> -->

    <van-button
      class="btn"
      type="primary"
      :disabled="inputValue === ''"
      @click="sendMessage"
      :loading="loading"
      >发送</van-button
    >
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { showToast } from "vant";
import { apiPostMessage } from "@/api";
// import { useRecord } from "./useRecord";

const props = defineProps<{
  form?: string;
  to: string;
  isGroup: "1" | "0";
  startTimer: (immediate: boolean) => void;
  title: string;
}>();
// const emit = defineEmits();

const inputValue = ref("");
const loading = ref(false);

// 发送消息
const sendMessage = async () => {
  if (inputValue.value === "" || !props.form) return;
  loading.value = true;
  // console.log("inputValue.value", inputValue.value);
  const msg = inputValue.value;
  const params = {
    form: props.form,
    to: props.to,
    isGroup: props.isGroup,
    addData: [{ time: Date.now(), msg, form: props.form }],
  };

  inputValue.value = "";
  apiPostMessage(params)
    .then((res) => {
      // showToast({
      //   message: "发送成功",
      //   position: "top",
      // });

      props.startTimer(true);
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

// 录音相关
const showRecord = ref(false);

// const { inRecord, recOpen, recStart, recStop, recPlay } = useRecord();
</script>

<style scoped lang="less">
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
  background-color: #f3f3f3;
  border: 0 solid var(--van-border-color);
  border-top-width: 1px;

  .recordIcon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 30px;
    cursor: pointer;
    color: #000;
  }
  .input {
    // padding: 12px;
    // width: calc(100% - 24px);
    flex: 1;
  }
  .record {
    flex: 1;
    text-align: center;
    font-weight: bold;
    padding: 10px 0;
    background-color: #fff;
    border-radius: 4px;
    -webkit-touch-callout: none; // /*系统默认菜单被禁用*/
    -webkit-user-select: none; /*webkit浏览器*/
    -khtml-user-select: none; /*早期浏览器*/
    -moz-user-select: none; /*火狐*/
    -ms-user-select: none; /*IE10*/
    user-select: none;
  }
  .btn {
    margin-left: 8px;
  }
}
</style>
