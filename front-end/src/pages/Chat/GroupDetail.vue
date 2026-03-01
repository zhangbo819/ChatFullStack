<template>
  <van-popup
    v-model:show="showDetail"
    position="right"
    :style="{ width: '80%', height: '100%' }"
    @close="close"
    closeable
    safe-area-inset-top
    safe-area-inset-bottom
  >
    <van-skeleton v-if="!GroupInfo || !GroupInfo.isGroup" title :row="3" />
    <section class="section" v-else>
      <van-cell-group>
        <van-cell title="群名称" :value="GroupInfo.title" />
        <van-cell title="群成员" :value="GroupInfo.data.length" />
      </van-cell-group>
      <div class="memberList">
        <div v-for="item in GroupInfo.data" :key="item.id" class="memberItem">
          <van-image width="40" height="40" :src="item.avatar" class="avatar" />
          <p>{{ item.name }}</p>
        </div>
      </div>
    </section>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  modelValue: boolean;
  GroupInfo: API_CHAT.GetConversationMemberInfos["res"]['data'] | null;
}>();
const emit = defineEmits();

const showDetail = ref(false);

const close = () => {
  showDetail.value = false;
  emit("update:modelValue", false);
};

watch(
  () => props.modelValue,
  (val) => {
    showDetail.value = val;
  },
  {
    immediate: true,
  }
);
</script>

<style scoped lang="less">
.section {
  margin-top: 40px;
}
.memberList {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  padding: 24px 0;
  width: 100%;
  .memberItem {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 8px;
  }
}
</style>
