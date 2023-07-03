import { createApp } from "vue";
import "vant/es/toast/style";
// import vConsole from 'vconsole'
import App from "./App.vue";
import router from "./router";
import pinia from "./store";
import "./style.css";

// const vconsole = new vConsole();

const AppBase = createApp(App);
AppBase.use(router)
  // .use(vconsole as any)
  .use(pinia)
  .mount("#app");
