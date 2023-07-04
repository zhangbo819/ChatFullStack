<template>
  <div class="bg">
    <van-nav-bar
      fixed
      placeholder
      safe-area-inset-top
      title="添加好友"
      left-arrow
      @click-left="onClickLeft"
    />

    <van-form @submit="handleSumbit">
      <van-cell-group inset>
        <van-field
          v-model="form.name"
          label="用户名"
          name="name"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请输入用户名' }]"
        />
      </van-cell-group>
      <van-button
        class="submitBtn"
        round
        block
        type="primary"
        native-type="submit"
        :loading="submitLoading"
        >添加</van-button
      >
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { showLoadingToast, closeToast } from "vant";
import { apiAddFriend } from "@/api";
import router from "@/router";

const form = ref({ name: "" });
const submitLoading = ref(false);

const onClickLeft = () => history.back();

const handleSumbit = async (values: Record<string, string>) => {
  submitLoading.value = true;
  apiAddFriend({ userid: values.name })
    .then((_) => {
      showLoadingToast({
        message: "添加成功",
        duration: 0,
        forbidClick: true,
      });

      setTimeout(() => {
        closeToast();
        router.replace("/");
      }, 1000);
    })
    .finally(() => {
      submitLoading.value = false;
    });
};
</script>

<style scoped lang="less">
.bg {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;

  .submitBtn {
    margin-top: 24px;
  }
}
</style>
