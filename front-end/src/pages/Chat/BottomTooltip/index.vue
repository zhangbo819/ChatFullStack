<template>
  <div>
    <!-- 按钮 -->
    <button @click="recOpen">打开录音,请求权限</button>
    | <button @click="recStart">开始录音</button>
    <button @click="recStop">结束录音</button>
    | <button @click="recPlay">本地试听</button>
  </div>
  <div style="padding-top: 5px">
    <!-- 波形绘制区域 -->
    <div
      style="
        border: 1px solid #ccc;
        display: inline-block;
        vertical-align: bottom;
      "
    >
      <div style="height: 100px; width: 300px" ref="recwave"></div>
    </div>
  </div>

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
      @click="inRecord ? recStop() : recStart()"
    >
      <!-- @click="inRecord ? refstopRecord && refstopRecord() : record()" -->
      <!-- @mousedown="record"
      @mouseup="refstopRecord && refstopRecord()"
      @touchstart="record"
      @touchend="refstopRecord && refstopRecord()" -->
      {{ inRecord ? "再次按下 停止" : "按下 说话 (测试)" }}
    </div>

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
import { showFailToast, showToast } from "vant";
import { apiPostMessage } from "@/api";

// 必须引入的核心
import Recorder from "recorder-core";
// 引入mp3格式支持文件；如果需要多个格式支持，把这些格式的编码引擎js文件放到后面统统引入进来即可
import "recorder-core/src/engine/mp3";
import "recorder-core/src/engine/mp3-engine";
// 可选的插件支持项，这个是波形可视化插件
import "recorder-core/src/extensions/waveview";

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
// const refstopRecord = ref(() => {});
// const audioUrl = ref("");
// const refAudio = ref();

// // 录音权限
// const record = () => {
//   console.log("开始录音");
//   window.navigator.mediaDevices
//     .getUserMedia({
//       audio: true,
//     })
//     .then((mediaStream) => {
//       inRecord.value = true;
//       console.log(mediaStream);
//       beginRecord(mediaStream);
//     })
//     .catch((err) => {
//       // 如果用户电脑没有麦克风设备或者用户拒绝了，或者连接出问题了等
//       // 这里都会抛异常，并且通过err.name可以知道是哪种类型的错误
//       console.error(err);
//       showFailToast(err.message);
//     });
// };

// // 开始录音
// function beginRecord(mediaStream: MediaStream) {
//   // let audioContext = new (window.AudioContext || window.webkitAudioContext)();
//   let audioContext = new window.AudioContext();
//   let mediaNode = audioContext.createMediaStreamSource(mediaStream);
//   // 创建一个jsNode
//   let jsNode = createJSNode(audioContext);
//   // 需要连到扬声器消费掉outputBuffer，process回调才能触发
//   // 并且由于不给outputBuffer设置内容，所以扬声器不会播放出声音
//   jsNode.connect(audioContext.destination);
//   jsNode.onaudioprocess = onAudioProcess;
//   // 把mediaNode连接到jsNode
//   mediaNode.connect(jsNode);

//   // 停止录音
//   refstopRecord.value = () => {
//     mediaStream.getAudioTracks()[0].stop();
//     mediaNode.disconnect();
//     jsNode.disconnect();

//     let leftData = mergeArray(leftDataList),
//       rightData = mergeArray(rightDataList);

//     const allData = interleaveLeftAndRight(leftData, rightData);

//     const wavBuffer = createWavFile(allData);

//     playRecord(wavBuffer);
//   };
// }

// function createJSNode(audioContext: AudioContext) {
//   const BUFFER_SIZE = 4096;
//   const INPUT_CHANNEL_COUNT = 2;
//   const OUTPUT_CHANNEL_COUNT = 2;
//   // createJavaScriptNode已被废弃
//   let creator = audioContext.createScriptProcessor;
//   // || audioContext.createJavaScriptNode;
//   creator = creator.bind(audioContext);
//   return creator(BUFFER_SIZE, INPUT_CHANNEL_COUNT, OUTPUT_CHANNEL_COUNT);
// }

// let leftDataList: Float32Array[] = [],
//   rightDataList: Float32Array[] = [];

// function onAudioProcess(event: AudioProcessingEvent) {
//   let audioBuffer = event.inputBuffer;
//   let leftChannelData = audioBuffer.getChannelData(0),
//     rightChannelData = audioBuffer.getChannelData(1);
//   // console.log(leftChannelData, rightChannelData);
//   // 需要克隆一下
//   leftDataList.push(leftChannelData.slice(0));
//   rightDataList.push(rightChannelData.slice(0));
// }

// function mergeArray(list: Float32Array[]) {
//   let length = list.length * list[0].length;
//   let data = new Float32Array(length),
//     offset = 0;
//   for (let i = 0; i < list.length; i++) {
//     data.set(list[i], offset);
//     offset += list[i].length;
//   }
//   return data;
// }

// function playRecord(arrayBuffer: ArrayBuffer) {
//   let blob = new Blob([new Uint8Array(arrayBuffer)]);
//   let blobUrl = URL.createObjectURL(blob);
//   console.log("blobUrl", blobUrl);
//   audioUrl.value = blobUrl;
//   inRecord.value = false;
//   setTimeout(() => {
//     refAudio.value.play();
//   }, 300);
// }

// // 交叉合并左右声道的数据
// function interleaveLeftAndRight(left: Float32Array, right: Float32Array) {
//   let totalLength = left.length + right.length;
//   let data = new Float32Array(totalLength);
//   for (let i = 0; i < left.length; i++) {
//     let k = i * 2;
//     data[k] = left[i];
//     data[k + 1] = right[i];
//   }
//   return data;
// }

// function createWavFile(audioData: Float32Array) {
//   const WAV_HEAD_SIZE = 44;
//   let buffer = new ArrayBuffer(audioData.length * 2 + WAV_HEAD_SIZE),
//     // 需要用一个view来操控buffer
//     view = new DataView(buffer);
//   // 写入wav头部信息
//   // RIFF chunk descriptor/identifier
//   writeUTFBytes(view, 0, "RIFF");
//   // RIFF chunk length
//   view.setUint32(4, 44 + audioData.length * 2, true);
//   // RIFF type
//   writeUTFBytes(view, 8, "WAVE");
//   // format chunk identifier
//   // FMT sub-chunk
//   writeUTFBytes(view, 12, "fmt ");
//   // format chunk length
//   view.setUint32(16, 16, true);
//   // sample format (raw)
//   view.setUint16(20, 1, true);
//   // stereo (2 channels)
//   view.setUint16(22, 2, true);
//   // sample rate
//   view.setUint32(24, 44100, true);
//   // byte rate (sample rate * block align)
//   view.setUint32(28, 44100 * 2, true);
//   // block align (channel count * bytes per sample)
//   view.setUint16(32, 2 * 2, true);
//   // bits per sample
//   view.setUint16(34, 16, true);
//   // data sub-chunk
//   // data chunk identifier
//   writeUTFBytes(view, 36, "data");
//   // data chunk length
//   view.setUint32(40, audioData.length * 2, true);

//   // 写入PCM数据
//   let length = audioData.length;
//   let index = 44;
//   let volume = 1;
//   for (let i = 0; i < length; i++) {
//     view.setInt16(index, audioData[i] * (0x7fff * volume), true);
//     index += 2;
//   }
//   return buffer;
// }
// function writeUTFBytes(view: DataView, offset: number, string: string) {
//   var lng = string.length;
//   for (var i = 0; i < lng; i++) {
//     view.setUint8(offset + i, string.charCodeAt(i));
//   }
// }

const rec = ref();
const wave = ref();
const recwave = ref();
const recBlob = ref();

const recOpen = () => {
  //创建录音对象
  rec.value = Recorder({
    type: "mp3", //录音格式，可以换成wav等其他格式
    sampleRate: 16000, //录音的采样率，越大细节越丰富越细腻
    bitRate: 16, //录音的比特率，越大音质越好
    onProcess: (
      buffers: any[],
      powerLevel: number,
      bufferDuration: any,
      bufferSampleRate: number,
      newBufferIdx: number,
      asyncEnd: any
    ) => {
      //录音实时回调，大约1秒调用12次本回调
      //可实时绘制波形，实时上传（发送）数据
      if (wave.value)
        wave.value.input(
          buffers[buffers.length - 1],
          powerLevel,
          bufferSampleRate
        );
    },
  });

  return new Promise((resolve, reject) => {
    //打开录音，获得权限
    rec.value.open(
      () => {
        console.log("录音已打开");
        if (recwave.value) {
          //创建音频可视化图形绘制对象
          wave.value = Recorder.WaveView({ elem: recwave.value });
        }
        resolve(true);
      },
      (msg: string, isUserNotAllow: boolean) => {
        //用户拒绝了录音权限，或者浏览器不支持录音
        console.log(
          (isUserNotAllow ? "UserNotAllow，" : "") + "无法录音:" + msg
        );
        showFailToast(
          (isUserNotAllow ? "UserNotAllow，" : "") + "无法录音:" + msg
        );
        reject(false);
      }
    );
  });
};
const recStart = () => {
  if (!rec.value) {
    console.error("未打开录音");
    return;
  }
  inRecord.value = true;
  rec.value.start();
  console.log("已开始录音");
};

const recStop = () => {
  if (!rec.value) {
    console.error("未打开录音");
    inRecord.value = false;
    return;
  }
  rec.value.stop(
    (blob: any, duration: number) => {
      //blob就是我们要的录音文件对象，可以上传，或者本地播放
      recBlob.value = blob;
      //简单利用URL生成本地文件地址，此地址只能本地使用，比如赋值给audio.src进行播放，赋值给a.href然后a.click()进行下载（a需提供download="xxx.mp3"属性）
      var localUrl = (window.URL || webkitURL).createObjectURL(blob);
      console.log("录音成功", blob, localUrl, "时长:" + duration + "ms");

      upload(blob); //把blob文件上传到服务器

      rec.value.close(); //关闭录音，释放录音资源，当然可以不释放，后面可以连续调用start
      rec.value = null;
      inRecord.value = false;
    },
    (err: any) => {
      console.error("结束录音出错：" + err);
      rec.value.close(); //关闭录音，释放录音资源，当然可以不释放，后面可以连续调用start
      rec.value = null;
      inRecord.value = false;
    }
  );
};

const upload = (blob: any) => {
  //使用FormData用multipart/form-data表单上传文件
  //或者将blob文件用FileReader转成base64纯文本编码，使用普通application/x-www-form-urlencoded表单上传
  var form = new FormData();
  form.append("upfile", blob, "recorder.mp3"); //和普通form表单并无二致，后端接收到upfile参数的文件，文件名为recorder.mp3
  form.append("key", "value"); //其他参数

  // var xhr=new XMLHttpRequest();
  // xhr.open("POST", "/upload/xxxx");
  // xhr.onreadystatechange=()=>{
  // 	if(xhr.readyState==4){
  // 		if(xhr.status==200){
  // 			console.log("上传成功");
  // 		}else{
  // 			console.error("上传失败"+xhr.status);
  // 		};
  // 	};
  // };
  // xhr.send(form);
};

const recPlay = () => {
  //本地播放录音试听，可以直接用URL把blob转换成本地播放地址，用audio进行播放
  var localUrl = URL.createObjectURL(recBlob.value);
  var audio = document.createElement("audio");
  audio.style.display = "none";
  audio.controls = true;
  document.body.appendChild(audio);
  audio.src = localUrl;
  audio.play(); //这样就能播放了

  //注意不用了时需要revokeObjectURL，否则霸占内存
  setTimeout(function () {
    URL.revokeObjectURL(audio.src);
    document.body.removeChild(audio);
  }, 5000);
};
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
