<template>
  <van-overlay :show="createGroupShow" @click="close">
    <div class="wrapper">
      <!-- @click.stop -->
      <section class="section" @click.stop>
        <h3 class="title">新建群聊</h3>
        <van-cell-group inset class="cellGroup">
          <van-form @submit="handleSumbit">
            <van-field
              v-model="form.name"
              label="群名"
              name="name"
              placeholder="请输入群名"
              :rules="[{ required: true, message: '请输入群名' }]"
            />

            <van-field
              name="members"
              label="复选框组"
              :rules="[
                {
                  required: true,
                  validator(val) {
                    if (val.length <= 2) {
                      return '至少选择三个人';
                    } else {
                      return true;
                    }
                  },
                },
              ]"
            >
              <template #input>
                <van-checkbox-group
                  v-model="form.members"
                  direction="horizontal"
                >
                  <van-checkbox
                    v-for="user in userList"
                    :key="user.id"
                    :name="user.id"
                    shape="square"
                    class="selectItem"
                    >{{ user.name }}
                    <van-image
                      width="40"
                      height="40"
                      :src="user.avatar"
                      class="avatar"
                    />
                  </van-checkbox>
                </van-checkbox-group>
              </template>
            </van-field>

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
        </van-cell-group>
      </section>
    </div>
  </van-overlay>
</template>

<script lang="ts" setup>
import { watch, onMounted, ref } from "vue";
import { showSuccessToast } from "vant";
import { useStore } from "@/store/user";
import { apiCreateGroup, apiGetUserList } from "@/api";
import router from "@/router";

const store = useStore();
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits();

const createGroupShow = ref(false);
const loading = ref(false);
// const userList = ref<GetUserList.Users>([]);
const userList = ref<API_USER.GetUserList["Users"][]>([]);
const form = ref({ name: "", members: [store.userInfo?.id] });
const submitLoading = ref(false);

onMounted(() => {
  getUesrList();
});

const getUesrList = () => {
  loading.value = true;
  apiGetUserList({ userid: store.userInfo?.id! })
    .then(({ data }) => {
      userList.value = data;
    })
    .finally(() => (loading.value = false));
};

const close = () => {
  createGroupShow.value = false;
  emit("update:modelValue", false);
};

watch(
  () => props.modelValue,
  (val) => {
    createGroupShow.value = val;
  },
  {
    immediate: true,
  },
);
const handleSumbit = (values: any) => {
  console.log(values);
  submitLoading.value = true;
  apiCreateGroup({
    name: values.name,
    userid: store.userInfo?.id!,
    members: values.members,
  })
    .then((res) => {
      const {
        data: { id },
      } = res;
      showSuccessToast("创建成功");
      router.push({
        path: "/Chat",
        query: { id },
      });
    })
    .finally(() => {
      submitLoading.value = false;
    });
};
</script>

<style lang="less" scoped>
.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(
    100vh - 50px - var(--van-tabbar-height) - env(safe-area-inset-bottom)
  );
}
.section {
  display: flex;
  flex-direction: column;
  // width: 86%;
  // min-height: 200px;
  padding: 16px 0;
  background-color: #fff;
  border-radius: 10px;

  .title {
    text-align: center;
    margin-bottom: 16px;
  }

  .cellGroup {
    height: 100%;
    .selectItem {
      margin-bottom: 8px;
      :deep .van-checkbox__label {
        display: flex;
        align-items: center;
      }
      .avatar {
        margin-left: 8px;
      }
    }
  }
}

.submitBtn {
  margin-top: 16px;
}
</style>
