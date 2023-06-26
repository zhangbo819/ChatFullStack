<template>
  <router-view />
  
  <van-tabbar fixed route>
    <van-tabbar-item replace to="/" icon="home-o">消息列表</van-tabbar-item>
    <van-tabbar-item replace to="/setting" icon="setting-o"
      >设置</van-tabbar-item
    >
  </van-tabbar>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped></style>
