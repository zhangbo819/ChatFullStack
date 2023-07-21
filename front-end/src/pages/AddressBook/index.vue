<template>
  <div>
    <van-nav-bar fixed placeholder safe-area-inset-top title="通讯录">
       <!-- <template #right>
        <van-popover
          v-model:show="showPopover"
          :actions="actions"
          @select="onSelect"
          placement="bottom-end"
          :offset="[12, 8]"
        >
          <template #reference>
            <van-icon name="plus" size="18" />
          </template>
        </van-popover>
      </template> -->
    </van-nav-bar>
    <p>好友列表(提到全局)</p>
    <p>群列表</p>
    <p>订阅机器人</p>
    <p>机器人列表</p>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped></style>
