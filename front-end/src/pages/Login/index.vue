<template>
  <div class="bg">
    <h3 @click="handleCode">登录</h3>

    <ElForm ref="ruleFormRef" :model="form" :rules="rules">
      <ElFormItem prop="name" label="用户名">
        <ElInput v-model="form.name" placeholder="请输入用户名" />
      </ElFormItem>

      <ElFormItem v-if="rootCodeShow" prop="rootCode" label="code">
        <ElInput v-model="form.rootCode" placeholder="" />
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
import { ref } from "vue";
import router from "@/router";
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElNotification,
  FormInstance,
} from "element-plus";
import { userLogin } from "@/api";

const rules = {
  name: [{ required: true, message: "请输入用户名", trigger: "change" }],
};
const ruleFormRef = ref<FormInstance>();

const form = ref({ name: "", rootCode: "" });
const submitLoading = ref(false);

const handleSumbit = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid, fields) => {
    if (!valid) return;
    console.log("submit!");

    const res = await userLogin({ ...form.value, userid: form.value.name });

    // console.log('res', res)

    localStorage.setItem("token", form.value.name);

    ElNotification.success("登录成功");

    setTimeout(() => {
      router.push("/");
    }, 1000);
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

  .submitBtn {
    margin-top: 24px;
  }
}
</style>
