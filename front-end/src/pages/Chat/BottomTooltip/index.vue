<template>
  <div class="bottomTooltip">
    <van-icon
      class="recordIcon"
      name="volume-o"
      @click="showRecord = !showRecord"
    />

    <van-field
      v-show="!showRecord"
      class="input"
      v-model="inputValue"
      @keyup.enter="sendMessage"
      :placeholder="`发送给 ${title}`"
    />
    <div
      v-show="showRecord"
      class="record"
      @click="inRecord ? refstopRecord && refstopRecord() : record()"
      >
      <!-- @mousedown="record"
      @mouseup="refstopRecord && refstopRecord()"
      @touchstart="record"
      @touchend="refstopRecord && refstopRecord()" -->
      {{ inRecord ? "再次按下 停止" : "按下 说话 (测试)" }}
    </div>

    <audio ref="refAudio" :src="audioUrl"></audio>

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
import { showFailToast, showToast } from "vant";
import { apiPostMessage } from "@/api";

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
const inRecord = ref(false);
const refstopRecord = ref(() => {});
const audioUrl = ref("");
const refAudio = ref()

// 录音权限
const record = () => {
  console.log("开始录音");
  window.navigator.mediaDevices
    .getUserMedia({
      audio: true,
    })
    .then((mediaStream) => {
      inRecord.value = true;
      console.log(mediaStream);
      beginRecord(mediaStream);
    })
    .catch((err) => {
      // 如果用户电脑没有麦克风设备或者用户拒绝了，或者连接出问题了等
      // 这里都会抛异常，并且通过err.name可以知道是哪种类型的错误
      console.error(err);
      showFailToast(err.message)
    });
};

// 开始录音
function beginRecord(mediaStream: MediaStream) {
  // let audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let audioContext = new window.AudioContext();
  let mediaNode = audioContext.createMediaStreamSource(mediaStream);
  // 创建一个jsNode
  let jsNode = createJSNode(audioContext);
  // 需要连到扬声器消费掉outputBuffer，process回调才能触发
  // 并且由于不给outputBuffer设置内容，所以扬声器不会播放出声音
  jsNode.connect(audioContext.destination);
  jsNode.onaudioprocess = onAudioProcess;
  // 把mediaNode连接到jsNode
  mediaNode.connect(jsNode);

  // 停止录音
  refstopRecord.value = () => {
    mediaStream.getAudioTracks()[0].stop();
    mediaNode.disconnect();
    jsNode.disconnect();

    let leftData = mergeArray(leftDataList),
      rightData = mergeArray(rightDataList);

    const allData = interleaveLeftAndRight(leftData, rightData);

    const wavBuffer = createWavFile(allData);

    playRecord(wavBuffer);
  };
}

function createJSNode(audioContext: AudioContext) {
  const BUFFER_SIZE = 4096;
  const INPUT_CHANNEL_COUNT = 2;
  const OUTPUT_CHANNEL_COUNT = 2;
  // createJavaScriptNode已被废弃
  let creator = audioContext.createScriptProcessor;
  // || audioContext.createJavaScriptNode;
  creator = creator.bind(audioContext);
  return creator(BUFFER_SIZE, INPUT_CHANNEL_COUNT, OUTPUT_CHANNEL_COUNT);
}

let leftDataList: Float32Array[] = [],
  rightDataList: Float32Array[] = [];

function onAudioProcess(event: AudioProcessingEvent) {
  let audioBuffer = event.inputBuffer;
  let leftChannelData = audioBuffer.getChannelData(0),
    rightChannelData = audioBuffer.getChannelData(1);
  // console.log(leftChannelData, rightChannelData);
  // 需要克隆一下
  leftDataList.push(leftChannelData.slice(0));
  rightDataList.push(rightChannelData.slice(0));
}

function mergeArray(list: Float32Array[]) {
  let length = list.length * list[0].length;
  let data = new Float32Array(length),
    offset = 0;
  for (let i = 0; i < list.length; i++) {
    data.set(list[i], offset);
    offset += list[i].length;
  }
  return data;
}

function playRecord(arrayBuffer: ArrayBuffer) {
  let blob = new Blob([new Uint8Array(arrayBuffer)]);
  let blobUrl = URL.createObjectURL(blob);
  console.log("blobUrl", blobUrl);
  audioUrl.value = blobUrl;
  inRecord.value = false;
  setTimeout(() => {
    refAudio.value.play()
  }, 300)
}

// 交叉合并左右声道的数据
function interleaveLeftAndRight(left: Float32Array, right: Float32Array) {
  let totalLength = left.length + right.length;
  let data = new Float32Array(totalLength);
  for (let i = 0; i < left.length; i++) {
    let k = i * 2;
    data[k] = left[i];
    data[k + 1] = right[i];
  }
  return data;
}

function createWavFile(audioData: Float32Array) {
  const WAV_HEAD_SIZE = 44;
  let buffer = new ArrayBuffer(audioData.length * 2 + WAV_HEAD_SIZE),
    // 需要用一个view来操控buffer
    view = new DataView(buffer);
  // 写入wav头部信息
  // RIFF chunk descriptor/identifier
  writeUTFBytes(view, 0, "RIFF");
  // RIFF chunk length
  view.setUint32(4, 44 + audioData.length * 2, true);
  // RIFF type
  writeUTFBytes(view, 8, "WAVE");
  // format chunk identifier
  // FMT sub-chunk
  writeUTFBytes(view, 12, "fmt ");
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // stereo (2 channels)
  view.setUint16(22, 2, true);
  // sample rate
  view.setUint32(24, 44100, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, 44100 * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2 * 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data sub-chunk
  // data chunk identifier
  writeUTFBytes(view, 36, "data");
  // data chunk length
  view.setUint32(40, audioData.length * 2, true);

  // 写入PCM数据
  let length = audioData.length;
  let index = 44;
  let volume = 1;
  for (let i = 0; i < length; i++) {
    view.setInt16(index, audioData[i] * (0x7fff * volume), true);
    index += 2;
  }
  return buffer;
}
function writeUTFBytes(view: DataView, offset: number, string: string) {
  var lng = string.length;
  for (var i = 0; i < lng; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
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
