<template>
  <div
    class="pages"
    :style="{ height: tabberShow ? safeAreaWithNav : safeAreaHeight }"
  >
    <router-view :style="{ height: '100%' }" />
  </div>

  <!-- <div id="safeArea"></div> -->
  <!-- :fixed="false" -->
  <van-tabbar
    route
    placeholder
    safe-area-inset-bottom
    v-show="tabberShow"
    id="safeArea"
  >
    <van-tabbar-item
      replace
      to="/"
      icon="chat-o"
      :badge="store.unread === 0 ? undefined : store.unread"
      >消息列表</van-tabbar-item
    >
    <van-tabbar-item replace to="/addressBook" icon="friends-o"
      >通讯录</van-tabbar-item
    >
    <van-tabbar-item replace to="/setting" icon="setting-o"
      >设置</van-tabbar-item
    >
  </van-tabbar>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "@/store/user";

const store = useStore();
const route = useRoute();
const safeAreaHeight = ref<string | number>("100%"); // 全部可视区大小
const safeAreaWithNav = ref<string | number>("100%"); // 减去下边栏剩余大小

const tabberShow = computed(() => !["/Chat", "/login"].includes(route.path));

onMounted(() => {
  setTimeout(() => {
    const el = document.getElementById("safeArea");
    safeAreaWithNav.value = Number(el?.offsetTop) + "px";
    safeAreaHeight.value =
      Number(el?.offsetTop) + Number(el?.offsetHeight) + "px";
    console.log("safeAreaWithNav", safeAreaWithNav.value);
    // console.log("safeAreaHeight", safeAreaHeight.value);
  });
});

// 获取全局用户信息
store.fetchUserInfo();
</script>

<style lang="less" scoped>
.pages {
  // position: absolute;
  // bottom: 0;
  width: 100%;
  box-sizing: border-box;
}
#safeArea {
  position: absolute;
  bottom: 0;
  // height: 1px;
  // width: 100%;
  // background-color: #000;
  // z-index: 1;
}
</style>
