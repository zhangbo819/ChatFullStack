<template>
  <div class="bg">
    <h3>登录</h3>

    <ElForm ref="ruleFormRef" :model="form" :rules="rules">
      <ElFormItem prop="name" label="用户名">
        <ElInput v-model="form.name" placeholder="请输入用户名" />
      </ElFormItem>
    </ElForm>

    <ElButton
      type="primary"
      class="submitBtn"
      @click="handleSumbit(ruleFormRef)"
      :loading="submitLoading"
      >提交</ElButton
    >
  </div>
</template>

<script setup lang="ts">
import { userLogin } from "@/api";
import router from "@/router";
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElNotification,
  FormInstance,
} from "element-plus";
import { ref } from "vue";

const rules = {
  name: [{ required: true, message: "请输入用户名", trigger: "change" }],
};
const ruleFormRef = ref<FormInstance>();

const form = ref({ name: "" });
const submitLoading = ref(false);

const handleSumbit = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid, fields) => {
    if (!valid) return;
    console.log("submit!");

    const res = await userLogin({ userid: form.value.name });

    console.log('res', res)

    localStorage.setItem("token", form.value.name);

    ElNotification.success("登录成功");

    setTimeout(() => {
      router.push("/");
    }, 1000);
  });
};
</script>

<style scoped lang="less">
.bg {
  display: flex;
  flex-direction: column;
  align-items: center;

  .submitBtn {
    margin-top: 24px;
  }
}
</style>
