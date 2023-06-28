<template>
  <div class="bg">
    <h3 @click="handleCode">登录</h3>

    <van-form @submit="handleSumbit">
      <van-cell-group inset>
        <van-field
          v-model="form.name"
          label="用户名"
          name="name"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请输入用户名' }]"
        />

        <van-field
          v-if="rootCodeShow"
          v-model="form.rootCode"
          label="code"
          name="rootCode"
          placeholder=""
        />
      </van-cell-group>
      <van-button
        class="submitBtn"
        round
        block
        type="primary"
        native-type="submit"
        :loading="submitLoading"
        >提交</van-button
      >
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import router from "@/router";
import { showLoadingToast, closeToast } from "vant";
import { userLogin } from "@/api";

const form = ref({ name: "", rootCode: "" });
const submitLoading = ref(false);

const handleSumbit = async (values: any) => {
  console.log("submit!");
  console.log("values", values);
  submitLoading.value = true;
  userLogin({ ...values, userName: values.name })
    .then((res: any) => {
      const { id, name } = res.data;
      console.log('res', res)
      // TODO remove store
      localStorage.setItem("token", id);
      localStorage.setItem("username", name);

      showLoadingToast({
        message: "登录成功",
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

const rootCodeShow = ref(false);
const clickCount = ref(0);

const handleCode = () => {
  // 点击 7 次出现
  clickCount.value++;
  if (clickCount.value > 6) {
    rootCodeShow.value = true;
  }
};
</script>

<style scoped lang="less">
.bg {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;

  > h3 {
    margin-bottom: 24px;
  }

  .submitBtn {
    margin-top: 24px;
  }
}
</style>
